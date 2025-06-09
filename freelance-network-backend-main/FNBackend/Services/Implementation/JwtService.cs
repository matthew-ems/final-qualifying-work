using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FNBackend.Context;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FNBackend.Services.Implementation;

public class JwtService : IJwt
{
    private readonly UserManager<EUser> _userManager;
    private readonly ApplicationDb _context;
    private readonly ILogger<JwtService> _logger;
    private readonly IPayLoadEncoder _payLoadEncoder;
    private readonly TokenCache _tokenCache;
    
    private readonly string _issuer;
    private readonly string _audience;
    private readonly string _additionalString;

    public JwtService
    (
        IConfiguration configuration,
        UserManager<EUser> userManager,
        ApplicationDb context,
        ILogger<JwtService> logger, 
        IPayLoadEncoder payLoadEncoder,
        TokenCache tokenCache
    )
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _payLoadEncoder = payLoadEncoder;
        _tokenCache = tokenCache;
        
        var jwtSettings = configuration.GetSection("Jwt");
        
        _issuer = jwtSettings["Issuer"];
        _audience = jwtSettings["Audience"];
        _additionalString = jwtSettings["Header"];
    }

    /// <summary>
    /// Generator jwt token by user role
    /// </summary>
    /// <param name="user">user who needs a token</param>
    /// <returns>Jwt token by user role</returns>
    private async Task<string> GenerateJwtTokenAsync(EUser user)
    {
        string personalKey = Guid.NewGuid().ToString().Replace("-","") + _additionalString;
        
        _logger.LogInformation($"Generating JWT Token: {personalKey}");
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(personalKey);

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new (ClaimTypes.Name, user.UserName),
            new (ClaimTypes.NameIdentifier, user.Id)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = Env.ACCESS_TOKEN_EXP,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        await CreateOrUpdateUserKeys(user.Id, personalKey);
        
        _tokenCache.Put(user.Id, personalKey);
        
        return $"{Headers.TokenType} {tokenHandler.WriteToken(token)}";
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="user"></param>
    /// <param name="userIp"></param>
    /// <returns></returns>
    public async Task<(string Token, string RefreshToken)> GenerateJwtAndRefreshTokenAsync(EUser user, string userIp)
    {
        var jwtToken = await GenerateJwtTokenAsync(user);

        var ip = string.IsNullOrEmpty(userIp) ? user.Id : userIp;
        
        var payLoad = _payLoadEncoder.EncryptPayLoad($"{user.Id}={ip}");

        var oldToken = await _context.RefreshTokens
            .Where(r => r.Revoked == null && r.UserId == user.Id)
            .FirstOrDefaultAsync();

        if (oldToken != null)
        {
            oldToken.UpdateDate();
            oldToken.Token = payLoad;
            oldToken.UserId = user.Id;
            oldToken.Expires = Env.REFRESH_TOKEN_EXP;
        }
        else
        {
            var refreshToken = new ERefreshToken
            {
                Token = payLoad,
                UserId = user.Id,
                Expires = Env.REFRESH_TOKEN_EXP,
                Created = DateTime.UtcNow
            };
            
            _context.RefreshTokens.Add(refreshToken);
        }
        
        await _context.SaveChangesAsync();

        return (jwtToken, payLoad);
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="token"></param>
    /// <param name="userIp"></param>
    /// <returns></returns>
    public async Task<string?> RefreshTokenAsync(string token, string userIp)
    {
        _logger.LogInformation("Start refreshing token");

        var refreshToken = await _context.RefreshTokens
            .SingleOrDefaultAsync(r => r.Token == token);

        if (refreshToken == null)
        {
            _logger.LogError("Invalid refresh token");
            
            return null!;
        }

        if (!refreshToken.IsActive)
        {
            _logger.LogError("Refresh token expired");
            
            if (refreshToken.Revoked == null)
            {
                refreshToken.Revoked = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }
            
            return null!;
        }
        
        var user = await _userManager.FindByIdAsync(refreshToken.UserId);

        var decodePayLoad = _payLoadEncoder.DecryptPayLoad(token);

        var decodedId = decodePayLoad.Split("=").First();
        var decodedIp = decodePayLoad.Split("=").Last();

        if (decodedId != user.Id || decodedIp != userIp)
        {
            _logger.LogError("Refresh token is not valid");
            
            refreshToken.SetInactive();
            
            await _context.SaveChangesAsync();
            
            return null!;
        }

        var jwtToken = await GenerateJwtTokenAsync(user);

        _logger.LogInformation($"Generated Bearer token[{refreshToken.UserId}]");

        await _context.SaveChangesAsync();

        _logger.LogInformation("Generated refresh token successful");

        return jwtToken;
    }

    private async Task CreateOrUpdateUserKeys(string userId, string newKey)
    {
        var result = await _context.UserKeys.FirstOrDefaultAsync(k => k.UserId == userId);

        if (result != null)
        {
            result.EncryptKey = newKey;

            _context.UserKeys.Update(result);
        }
        else
        {
            var newRecord = new EUserKeys
            {
                UserId = userId,
                EncryptKey = newKey
            };
            
            await _context.UserKeys.AddAsync(newRecord);
        }

        await _context.SaveChangesAsync();
    }
}
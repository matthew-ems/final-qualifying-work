using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using FNBackend.Services;

namespace FNBackend.Middlewares;

public class TokenValidationMiddleware
{
    private readonly RequestDelegate _next;
    
    private readonly ILogger<TokenValidationMiddleware> _logger;
    private readonly TelegramService _telegramService;
    private readonly TokenCache _tokenCache;

    public TokenValidationMiddleware
    (
        RequestDelegate next,
        ILogger<TokenValidationMiddleware> logger,
        TelegramService telegramService,
        TokenCache tokenCache
    )
    {
        _next = next;
        _logger = logger;
        _telegramService = telegramService;
        _tokenCache = tokenCache;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="httpContext"></param>
    public async Task InvokeAsync(HttpContext httpContext)
    {
        var endpoint = httpContext.GetEndpoint();
        var jwtAuthorize = endpoint?.Metadata?.GetMetadata<JwtAuthorizeAttribute>();
        var telegramValidation = endpoint?.Metadata?.GetMetadata<TelegramValidationAttribute>();
        
        if (telegramValidation != null && Env.ENVIRONMENT != Enviroment.Development)
        {
            var telegramData = httpContext.Request.Headers[Headers.TelegramHeader].FirstOrDefault();
            
            var identity = telegramData?.Split(" ").First();
            var initData = telegramData?.Split(" ").Last();

            if (identity != Headers.TelegramDataType || string.IsNullOrEmpty(initData))
            {
                _logger.LogWarning("Invalid Telegram Data Provided");
                httpContext.Response.StatusCode = 406;
                await httpContext.Response.WriteAsync("Invalid Telegram Data Provided");
                return;
            }
            
            if (!_telegramService.ValidateInitData(initData))
            {
                _logger.LogWarning("Invalid Telegram Data");
                httpContext.Response.StatusCode = 406;
                await httpContext.Response.WriteAsync("Invalid Telegram Data");
                return;
            }
            
            if (jwtAuthorize == null)
            {
                await _next(httpContext);

                return;
            }
        }
        
        if (jwtAuthorize == null)
        {
            await _next(httpContext);
            return;
        }
        
        var token = httpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("Token is missing");
            httpContext.Response.StatusCode = 401;
            await httpContext.Response.WriteAsync("Token is missing");
            return;
        }

        try
        {
            var handler = new JwtSecurityTokenHandler();

            var jwtToken = handler.ReadJwtToken(token);

            if (!CheckTokenDate(jwtToken))
            {
                _logger.LogWarning("Token has expired");
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsync("Token has expired");
                return;
            }

            if (!CheckAccess(jwtAuthorize, jwtToken))
            {
                _logger.LogWarning("Access Denied");
                httpContext.Response.StatusCode = 403;
                await httpContext.Response.WriteAsync("Access Denied");
                return;
            }

            if (!TryGetUserId(jwtToken, out var userId))
            {
                _logger.LogWarning("Token hasn't user id");
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsync("Token hasn't user id");
                return;
            }

            if (!_tokenCache.TryGet(userId, out var key))
            {
                _logger.LogWarning("Something went wrong");
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsync("Something went wrong");
                return;
            }
            
            if (!VerifySignature(token, key))
            {
                _logger.LogWarning("Invalid token");
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsync("Invalid token");
                return;
            }
            
            var identity = new ClaimsIdentity(jwtToken.Claims, "jwt");
            if (TryGetUserId(jwtToken, out _))
            {
                if (!identity.HasClaim(c => c.Type == ClaimTypes.NameIdentifier))
                {
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId));
                }
            }
            var principal = new ClaimsPrincipal(identity);
            httpContext.User = principal;
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "Error during token validation");
            httpContext.Response.StatusCode = 401;
            await httpContext.Response.WriteAsync("Error during token validation");
            return;
        }
        
        await _next(httpContext);
    }
    
    private bool TryGetUserId(JwtSecurityToken jwtToken, out string userId)
    {
        userId = String.Empty;

        var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "nameid");
        
        if (userIdClaim != null)
        {
            userId = userIdClaim.Value;

            return true;
        }

        return false;
    }

    private bool CheckTokenDate(JwtSecurityToken token)
    {
        if (token.Payload.Exp == null)
        {
            return false;
        }
        
        var expirationTime = DateTimeOffset.FromUnixTimeSeconds(token.Payload.Exp.Value).UtcDateTime;
        
        return DateTime.UtcNow <= expirationTime;
    }
    
    private bool VerifySignature(string token, string key)
    {
        var parts = token.Split('.');
        
        if (parts.Length != 3)
        {
            return false;
        }
        
        var unsignedToken = $"{parts[0]}.{parts[1]}"; 
        var expectedSignature = Base64UrlDecode(parts[2]);
        
        using var hmac = new HMACSHA256(Encoding.ASCII.GetBytes(key));
        var computedSignature = hmac.ComputeHash(Encoding.UTF8.GetBytes(unsignedToken));
        
        return computedSignature.SequenceEqual(expectedSignature);
    }
    
    private byte[] Base64UrlDecode(string input)
    {
        var base64 = input.Replace('-', '+').Replace('_', '/');
        switch (input.Length % 4)
        {
            case 2: base64 += "=="; break;
            case 3: base64 += "="; break;
        }
        return Convert.FromBase64String(base64);
    }

    private bool CheckAccess(JwtAuthorizeAttribute attribute, JwtSecurityToken jwtToken)
    {
        var role = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "role")?.Value;

        if (role == null) return false;
        
        if (attribute.Role == role || role == Roles.Admin)
            return true;
        
        return attribute.Role == String.Empty && Roles.ValidationRole(role);
    }
}
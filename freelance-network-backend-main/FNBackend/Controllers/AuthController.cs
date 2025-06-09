using FNBackend.Context;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using FNBackend.Services;
using FNBackend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FNBackend.Controllers;

[Route($"{Http.RouteBase}/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<EUser> _userManager;
    private readonly ApplicationDb _applicationDb;
    private readonly ILogger<UserController> _logger;
    private readonly IJwt _jwtService;

    public AuthController
    (
        UserManager<EUser> userManager,
        ILogger<UserController> logger,
        IJwt jwtService,
        ApplicationDb applicationDb
    )
    {
        _jwtService = jwtService;
        _userManager = userManager;
        _logger = logger;
        _applicationDb = applicationDb;
    }

    /// <summary>
    /// Authenticates a user based on the provided user ID.
    /// </summary>
    /// <param name="userId">The ID of the user to authenticate.</param>
    /// <returns>An IActionResult indicating the result of the authentication process.</returns>
    /// <response code="404">Возвращается, если пользователь не зарегистрирован.</response>
    [HttpPost("{userId}")]
    [TelegramValidation]
    public async Task<IActionResult> Authorization([FromRoute] string userId)
    {
        _logger.LogInformation($"User[{userId}] Authenticated");
        
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            _logger.LogError($"User[{userId}] is not registered");

            return NotFound($"User[{userId}] is not registered");
        }
        
        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        var result = await _jwtService.GenerateJwtAndRefreshTokenAsync(user, userIp);
        
        return Ok(new
        {
            Token = result.Token,
            RefreshToken = result.RefreshToken
        });
    }
    
    /// <summary>
    /// Обновить токен если активный протух
    /// </summary>
    /// <param name="refreshToken"></param>
    /// <response code="400">Возвращается, при неудачной попытке создания токена или проверке временного.</response>
    /// <response code="200">Возвращается с новым JWT токеном.</response>
    [HttpPost("refresh-token")]
    [TelegramValidation]
    public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
    {
        _logger.LogInformation($"Start refresh token[{refreshToken.Substring(0, Math.Min(10, refreshToken.Length))}]");
        
        try
        {
            var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            
            var newToken = await _jwtService.RefreshTokenAsync(refreshToken, userIp);

            if (newToken == null)
            {
                _logger.LogInformation("Refresh token is invalid");

                return BadRequest("Refresh token is invalid, Token has been revoked");
            }

            _logger.LogInformation("Refresh token success");
            
            return Ok(new
            {
                Token = newToken,
            });
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogError($"Refresh token error: {ex.Message}");
            
            return BadRequest(new { message = ex.Message });
        }
    }
}
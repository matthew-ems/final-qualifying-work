using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using FNBackend.Entities;
using FNBackend.Dto.User;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using FNBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/user")]
public class UserController : ControllerBase
{
    private readonly UserManager<EUser> _userManager;
    private readonly ILogger<UserController> _logger;
    private readonly IProfile _profileService;

    public UserController
    (
        UserManager<EUser> userManager,
        ILogger<UserController> logger,
        IProfile profileService
    )
    {
        _profileService = profileService;
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves the profile information for a specified user.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <returns>The users profile information.</returns>
    /// <response code="404">User not found.</response>
    /// <response code="200">Successfully retrieved user information.</response>
    [HttpGet("get-user-info/{userId}")]
    [JwtAuthorize]
    [TelegramValidation]
    public async Task<IActionResult> GetUserInfo([FromRoute] string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            _logger.LogError($"User not found by Id: {userId}");
            
            return NotFound($"User not found by Id: {userId}");
        }

        UserInfoDto dto = new UserInfoDto(user);
        
        return Ok(new { success = true, dto });
    }

    /// <summary>
    /// Регистрирует пользователя на первичном уровне.
    /// </summary>
    /// <param name="data">Данные телеграм пользователя</param>
    /// <response code="200">Возвращается с JWT токеном при успешной авторизации.</response>
    /// <response code="500">Что то пошло не так на строне сервера. Подробности в сообщении.</response>
    /// <response code="409">Возвращается если пользователь уже зарегистрирован или у него есть профиль.</response>
    [HttpPost("register")]
    [TelegramValidation]
    public async Task<IActionResult> Register([FromBody] RegisterDto data)
    {
        _logger.LogInformation($"User[{data.id}] into registration");
        
        var existingUser = await _userManager.FindByIdAsync(data.id);

        if (existingUser != null)
        {
            _logger.LogError($"User with ID {data.id} already exists");
            
            return Conflict($"User with ID {data.id} already exists.");
        }

        var user = new EUser
        {
            Id = data.id,
            UserName = data.username,
            FirstName = data.first_name,
            LastName = data.last_name,
            PhotoUrl = data.photo_url, 
            LanguageCode = data.language_code
        };

        var result = await _userManager.CreateAsync(user);
        
        if (!result.Succeeded)
        {
            _logger.LogError($"User[{data.id}] is not registered: {result.Errors.FirstOrDefault()?.Description}");
            
            return StatusCode(500, $"User[{data.id}] is not registered: {result.Errors.FirstOrDefault()?.Description}");
        }

        _logger.LogInformation($"User[{data.id}] start creating profile");
        
        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        var profileResult = await _profileService.Create(data.id, userIp, data);

        if (profileResult.StatusCode != 200)
        {
            return StatusCode(profileResult.StatusCode, profileResult.Message);
        }

        return StatusCode(profileResult.StatusCode, new
        {
            Token = profileResult.Token,
            RefreshToken = profileResult.RefreshToken
        });
    }
}
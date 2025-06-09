using System.Security.Claims;
using FNBackend.Context;
using FNBackend.Dto.ControllerDtos;
using FNBackend.Dto.User;
using Microsoft.AspNetCore.Mvc;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using FNBackend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/profile")]
public class ProfileController : ControllerBase
{
    private readonly ApplicationDb _applicationDb;
    private readonly UserManager<EUser> _userManager;
    private readonly IJwt _jwt;
    private readonly ILogger<ProfileController> _logger;
    private readonly IProfile _profileService;

    public ProfileController
    (
        ApplicationDb applicationDb,
        UserManager<EUser> userManager,
        IJwt jwt,
        ILogger<ProfileController> logger,
        IProfile profileService
    )
    {
        _profileService = profileService;
        _applicationDb = applicationDb;
        _userManager = userManager;
        _jwt = jwt;
        _logger = logger;
    }

    /// <summary>
    /// Creates a user profile for a specified user.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <param name="profileDto">The profile creation data transfer object.</param>
    /// <returns>A response indicating the result of the profile creation process.</returns>
    /// <response code="404">User not found.</response>
    /// <response code="200">The users profile has been successfully added.</response>
    /// <response code="409">This user already has a profile with this role.</response>
    [HttpPost("create/{userId}")]
    [TelegramValidation]
    public async Task<IActionResult> Create([FromRoute] string userId, [FromBody] ProfileDto profileDto)
    {
        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _profileService.Create(userId, userIp, profileDto);

        return StatusCode(result.StatusCode, result.Message);
    }

    /// <summary>
    /// Updating Profile
    /// </summary>
    /// <param name="userId">Id user</param>
    /// <param name="profileDto">DTo for updating user</param>
    /// <response code="404">User not found.</response>
    /// <response code="200">The users profile has been successfully updated.</response>
    /// <response code="409">This user hasn't a profile with this role.</response>
    [HttpPut("update/{userId}")]
    [TelegramValidation]
    [JwtAuthorize]
    public async Task<IActionResult> Update([FromRoute] string userId, [FromBody] ProfileDto profileDto)
    {
        var result = await _profileService.Update(userId, profileDto);

        return StatusCode(result.StatusCode, result.Message);
    }
    
    /// <summary>
    /// Changes the user's role to another if he already has a second profile.
    /// </summary>
    /// <param name="profileDto">Data on the roles to be changed</param>
    /// <response code="200">Returned with a JWT token if the profile is successfully changed</response>
    /// <response code="500">Returned if the user is not found in the system</response>
    /// <response code="423">Returned if the user wants to change the role to admin or the admin wants to change the role</response>
    /// <response code="400">Returned if there is no such role in the system</response>
    /// <response code="404">Returned if there is no profile with the new role in the system</response>
    [HttpPost("switch")]
    [JwtAuthorize]
    [TelegramValidation]
    public async Task<IActionResult> Switch([FromBody] SwitchProfileDto profileDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            _logger.LogError("User Unauthorized");

            return StatusCode(500, "User not found");
        }

        if (Roles.CheckAdminRole(profileDto.FromRole) || Roles.CheckAdminRole(profileDto.ToRole))
        {
            _logger.LogError($"An attempt to change or activate the admin role by the User[{user.Id}] was rejected.");

            return StatusCode(423, "Role change rejected, unable to change admin or become admin");
        }

        if (!Roles.ValidationRole(profileDto.FromRole) || !Roles.ValidationRole(profileDto.ToRole))
        {
            string errorText = $"The role has not been validated. From: {profileDto.FromRole}. To: {profileDto.ToRole}";

            _logger.LogError(errorText);

            return BadRequest(errorText);
        }

        var userInfo = await _applicationDb.Users
            .AsNoTracking()
            .Include(u => u.ProfileInfos)
            .FirstOrDefaultAsync(u => u.Id == userId);

        var profile = userInfo?.ProfileInfos.FirstOrDefault(p => p.Role == profileDto.ToRole);

        if (profile == null)
        {
            string errorText = $"TThe user does not have a profile with this role[{profileDto.ToRole}]";

            _logger.LogError(errorText);

            return NotFound(errorText);
        }

        await _userManager.RemoveFromRoleAsync(user, profileDto.FromRole);

        await _userManager.AddToRoleAsync(user, profileDto.ToRole);

        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var token = await _jwt.GenerateJwtAndRefreshTokenAsync(user, userIp);

        return Ok(new TokenDto
        {
            Token = token.Token,
            RefreshToken = token.RefreshToken
        });
    }

    /// <summary>
    /// Getting user profile information
    /// </summary>
    /// <response code="400">Role not found</response>
    /// <response code="200">Returns profile information</response>
    /// <response code="404">Returned if the user was not found or there is no profile for the current role</response>
    [HttpGet("get-profile-info")]
    [JwtAuthorize]
    public async Task<IActionResult> GetProfileInfo()
    {
        _logger.LogInformation("Getting profile info...");
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        string errorMessage;

        var user = await _applicationDb.Users
            .AsNoTracking()
            .Include(u => u.ProfileInfos)
            .ThenInclude(eProfileInfo => eProfileInfo.Direction)
            .Include(eUser => eUser.ProfileInfos)
            .ThenInclude(eProfileInfo => eProfileInfo.Experience)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            errorMessage = "User not found.";

            _logger.LogError(errorMessage);

            return NotFound(errorMessage);
        }
        
        var userRole = User.Claims.FirstOrDefault(c => c.Type == Roles.Main)?.Value;
        
        if (string.IsNullOrEmpty(userRole))
        {
            errorMessage = "User role is not defined.";
        
            _logger.LogError(errorMessage);
        
            return BadRequest(errorMessage);
        }
        
        var currentProfile = user.ProfileInfos
            .FirstOrDefault(p => p.Role == userRole);
        
        if (currentProfile == null)
        {
            errorMessage = "The user does not have a profile for the current role.";

            _logger.LogError(errorMessage);

            return NotFound(errorMessage);
        }

        if (currentProfile.Role == Roles.Performer)
        {
            _logger.LogInformation("Return performer profile info");
            
            var performerDto = new GetPerformerDto
            {
                PhotoUrl = user.PhotoUrl,
                Bio = currentProfile.Bio,
                Experience = currentProfile.Experience.Title,
                Direction = currentProfile.Direction.Title,
                Role = currentProfile.Role,
                Tags = currentProfile.Tags
            };
            
            return Ok(performerDto);
        }

        _logger.LogInformation("Return customer profile info");
        
        var customerDto = new GetCustomerDto
        {
            PhotoUrl = user.PhotoUrl,
            Bio = currentProfile.Bio,
            Role = currentProfile.Role
        };
        
        return Ok(customerDto);
    }
}
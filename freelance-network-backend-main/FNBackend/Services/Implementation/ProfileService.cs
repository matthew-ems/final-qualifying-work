using FNBackend.Context;
using FNBackend.Dto.User;
using FNBackend.Entities;
using FNBackend.Entities.Enums;
using FNBackend.Services.Implementation.Models;
using FNBackend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Services.Implementation;

public class ProfileService : IProfile
{
    private readonly ApplicationDb _applicationDb;
    private readonly UserManager<EUser> _userManager;
    private readonly ILogger<ProfileService> _logger;
    private readonly IJwt _jwt;

    private readonly DbSet<EProfileInfo> _eProfile;

    public ProfileService
    (
        ApplicationDb applicationDb,
        UserManager<EUser> userManager,
        ILogger<ProfileService> logger,
        IJwt jwt
    )
    {
        _jwt = jwt;
        _applicationDb = applicationDb;
        _userManager = userManager;
        _logger = logger;

        _eProfile = _applicationDb.ProfileInfos;
    }

    public async Task<ProfileCreateResponce> Create
    (
        string userId,
        string userIp,
        ProfileDto profileDto
    )
    {
        string errorMessage;

        var user = await _applicationDb.Users
            .Include(u => u.ProfileInfos)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            errorMessage = $"User not found by Id: {userId}";

            _logger.LogError(errorMessage);

            return new ProfileCreateResponce
            {
                Success = false,
                StatusCode = 404,
                Message = errorMessage
            };
        }

        var existingProfile = user.ProfileInfos.FirstOrDefault(p => p.Role == profileDto.Role);

        if (existingProfile != null)
        {
            errorMessage = "This user already has a profile with this role.";

            _logger.LogError(errorMessage);

            return new ProfileCreateResponce
            {
                Success = false,
                StatusCode = 409,
                Message = errorMessage
            };
        }

        EProfileInfo profileInfo = new()
        {
            UserId = userId,
            Bio = profileDto.Bio,
            Role = profileDto.Role
        };

        if (profileDto.Role == Roles.Customer)
        {
            profileInfo.DirectionId = _applicationDb.Directions.AsNoTracking().First().Id;
            profileInfo.ExperienceId = _applicationDb.Experiences.AsNoTracking().First().Id;
        }
        else
        {
            profileInfo.DirectionId = profileDto.DirectionId;
            profileInfo.ExperienceId = profileDto.ExperienceId;
            profileInfo.Tags = profileDto.Tags;
        }

        await _eProfile.AddAsync(profileInfo);

        await _applicationDb.SaveChangesAsync();

        await _userManager.AddToRoleAsync(user, profileInfo.Role);

        var tokenResult = await _jwt.GenerateJwtAndRefreshTokenAsync(user, userIp);

        return new ProfileCreateResponce
        {
            Success = true,
            StatusCode = 200,
            Message = "The users profile has been successfully added",
            Token = tokenResult.Token,
            RefreshToken = tokenResult.RefreshToken
        };
    }

    public async Task<ProfileCreateResponce> Update(string userId, ProfileDto profileDto)
    {
        string errorMessage;

        var user = await _applicationDb.Users
            .Include(u => u.ProfileInfos)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            errorMessage = $"User not found by Id: {userId}";

            _logger.LogError(errorMessage);

            return new ProfileCreateResponce
            {
                Success = false,
                StatusCode = 404,
                Message = errorMessage
            };
        }

        var existingProfile = user.ProfileInfos.FirstOrDefault(p => p.Role == profileDto.Role);

        if (existingProfile == null)
        {
            errorMessage = "This user hasn't a profile with this role.";

            _logger.LogError(errorMessage);

            return new ProfileCreateResponce
            {
                Success = false,
                StatusCode = 409,
                Message = errorMessage
            };
        }

        existingProfile.Bio = profileDto.Bio;
        existingProfile.DirectionId = profileDto.DirectionId;
        existingProfile.ExperienceId = profileDto.ExperienceId;
        existingProfile.Tags = profileDto.Tags;
        
        _eProfile.Update(existingProfile);

        await _applicationDb.SaveChangesAsync();
        

        return new ProfileCreateResponce
        {
            Success = true,
            StatusCode = 200,
            Message = "The users profile has been successfully updated",
        };
    }
}
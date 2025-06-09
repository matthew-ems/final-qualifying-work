using FNBackend.Dto.User;
using FNBackend.Services.Implementation.Models;

namespace FNBackend.Services.Interfaces;

public interface IProfile
{
    /// <summary>
    /// Creates a user profile for a specified user.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <param name="userIp"></param>
    /// <param name="profileDto">The profile creation data transfer object.</param>
    /// <returns>A response indicating the result of the profile creation process.</returns>
    /// <remarks>
    /// <para>Possible HTTP Status Codes:</para>
    /// <list type="bullet">
    /// <item><description>200: The user's profile has been successfully added.</description></item>
    /// <item><description>404: User not found.</description></item>
    /// <item><description>409: This user already has a profile with this role.</description></item>
    /// </list>
    /// </remarks>
    Task<ProfileCreateResponce> Create(string userId, string userIp, ProfileDto profileDto);

    Task<ProfileCreateResponce> Update(string userId, ProfileDto profileDto);
}
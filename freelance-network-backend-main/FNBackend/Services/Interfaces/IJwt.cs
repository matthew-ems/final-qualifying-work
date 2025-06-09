using FNBackend.Entities;

namespace FNBackend.Services.Interfaces;

public interface IJwt
{
    Task<(string Token, string RefreshToken)> GenerateJwtAndRefreshTokenAsync(EUser user, string userIP);
    Task<string?> RefreshTokenAsync(string token, string userIp);
}
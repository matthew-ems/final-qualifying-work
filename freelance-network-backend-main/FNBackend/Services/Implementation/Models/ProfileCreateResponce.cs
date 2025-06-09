namespace FNBackend.Services.Implementation.Models;

public class ProfileCreateResponce
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}
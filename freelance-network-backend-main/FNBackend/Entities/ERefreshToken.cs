using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class ERefreshToken : IntDataEntity
{
    public string Token { get; set; }
    public string UserId { get; set; }
    public DateTime Expires { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Revoked { get; set; }
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public bool IsActive => Revoked == null && !IsExpired;

    public void SetInactive() => Revoked = DateTime.UtcNow;
}

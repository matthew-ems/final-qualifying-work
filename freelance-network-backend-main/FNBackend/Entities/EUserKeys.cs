using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class EUserKeys : IntDataEntity
{
    public string UserId { get; set; }
    public string EncryptKey { get; set; }
}
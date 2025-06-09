using FNBackend.Entities;
using FNBackend.Entities.Enums;

namespace FNBackend.Dto.User;

[Serializable]
public class UserInfoDto
{
    public string FirstName { get; set; } = "-";
    public string LastName { get; set; } = "-";
    public string PhotoUrl { get; set; } = "-";
    public string LanguageCode { get; set; } = "-";

    public CurrencyType CurrencyType { get; set; }
    
    public UserInfoDto(EUser eUser)
    {
        FirstName = eUser.FirstName;
        LastName = eUser.LastName;
        PhotoUrl = eUser.PhotoUrl;
        LanguageCode = eUser.LanguageCode;
        CurrencyType = eUser.CurrencyType;
    }
}
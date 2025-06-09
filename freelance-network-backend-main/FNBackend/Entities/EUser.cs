using System.ComponentModel.DataAnnotations;
using FNBackend.Entities.Enums;
using Microsoft.AspNetCore.Identity;

namespace FNBackend.Entities;

public class EUser : IdentityUser
{
    [MaxLength(100)] public string FirstName { get; set; } = "-";
    [MaxLength(100)] public string LastName { get; set; } = "-";
    [MaxLength(500)] public string PhotoUrl { get; set; } = "-";
    [MaxLength(10)] public string LanguageCode { get; set; } = "-";

    public CurrencyType CurrencyType { get; set; }

    public virtual ICollection<EProfileInfo> ProfileInfos { get; set; } = new List<EProfileInfo>();
}
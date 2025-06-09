using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FNBackend.Entities.Base;
using FNBackend.Entities.Enums;

namespace FNBackend.Entities;

public class EProfileInfo : DataEntity
{
    [MaxLength(2000)] public string Bio { get; set; } = "-";

    public int FreeResponsesPerDay { get; set; } = 3;
    public int RemainingFreeResponses { get; set; } = 3;

    public int BonusResponses { get; set; } = 0;

    public DateTime LastResponseReset { get; set; } = DateTime.UtcNow;
    
    public Guid DirectionId { get; set; }
    public Guid ExperienceId { get; set; }

    public string Tags { get; set; } = "";
    
    public string Role { get; set; }

    [ForeignKey("DirectionId")] public EDirection Direction { get; set; }
    [ForeignKey("ExperienceId")] public EExperience Experience { get; set; }

    public string UserId { get; set; }
    
    public EUser User { get; set; }
}
namespace FNBackend.Dto.User;

/// <summary>
/// DTO for creating a user profile.
/// </summary>
public class ProfileDto
{
    /// <summary>
    /// The biography or personal description of the user.
    /// </summary>
    public string Bio { get; set; } = "-";

    /// <summary>
    /// The identifier of the user's experience level.
    /// </summary>
    public Guid ExperienceId { get; set; }

    /// <summary>
    /// The identifier of the user's direction or field of expertise.
    /// </summary>
    public Guid DirectionId { get; set; } = Guid.Empty;

    public string Role { get; set; }
    
    public string Tags { get; set; }
}
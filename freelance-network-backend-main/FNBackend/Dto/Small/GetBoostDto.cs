namespace FNBackend.Dto.Small;

public class GetBoostDto : BoostDto
{
    public Guid Id { get; set; } = Guid.Empty;
}
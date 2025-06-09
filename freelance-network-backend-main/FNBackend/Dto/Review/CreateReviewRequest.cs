namespace FNBackend.Dto.Review;

public class CreateReviewRequest
{
    public string TargetUserId { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
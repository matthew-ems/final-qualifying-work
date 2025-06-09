using FNBackend.Entities;

namespace FNBackend.Dto.Review;

public class ReviewResponse
{
    public Guid Id { get; set; }
    public string TargetUserId { get; set; } = String.Empty;
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = String.Empty;
    public string AuthorId { get; set; } = String.Empty;
    public DateTime CreatedAt { get; set; }

    public void ConvertFromModel(EReview review)
    {
        Id = review.Id;
        AuthorId = review.AuthorId;
        TargetUserId = review.TargetUserId!;
        OrderId = (int)review.OrderId!;
        Rating = review.Rating;
        Comment = review.Comment;
        CreatedAt = review.CreatedAt;
    }
}
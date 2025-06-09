using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class EReview : DataEntity
{
    public string AuthorId { get; set; }
    public EUser Author { get; set; }

    public string? TargetUserId { get; set; }
    public EUser? TargetUser { get; set; }

    public int? OrderId { get; set; }
    public EOrder? Order { get; set; }

    public int Rating { get; set; }
    public string Comment { get; set; }
}
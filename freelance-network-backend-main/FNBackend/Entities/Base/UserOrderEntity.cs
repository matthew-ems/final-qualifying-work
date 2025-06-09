namespace FNBackend.Entities.Base;

public class UserOrderEntity : DataEntity
{
    public string UserId { get; set; }
    public int OrderId { get; set; }

    public EUser User { get; set; }
    public EOrder Order { get; set; }
}
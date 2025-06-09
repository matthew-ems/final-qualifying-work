using FNBackend.Entities.Enums;

namespace FNBackend.Dto.Order;

public class UpdateOrderDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "-";
    public string Description { get; set; } = "";
    public int TotalAmount { get; set; } = 0;
    public string Tags { get; set; }
    public CurrencyType Currency { get; set; } = CurrencyType.Default;

    public OrderStatus Status { get; set; } = OrderStatus.Default;

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Default;

    public BoostType Boost { get; set; }

    public Guid DirectionId { get; set; }
    public string PerformerId { get; set; }

    public (bool IsValid, List<string>? Errors) Validate()
    {
        var errors = new List<string>();

        if (Id < 0) errors.Add("id bellow 0");

        if (string.IsNullOrWhiteSpace(Title)) errors.Add("Title is null");

        if (string.IsNullOrWhiteSpace(Description)) errors.Add("Description is null");

        if (TotalAmount < 0) errors.Add("TotalAmount bellow 0");

        if (DirectionId == Guid.Empty) errors.Add("DirectionId is empty");

        if (!Enum.IsDefined(typeof(CurrencyType), Currency)) errors.Add("CurrencyType Is Defined");

        if (!Enum.IsDefined(typeof(OrderStatus), Status)) errors.Add("OrderStatus Is Defined");

        if (!Enum.IsDefined(typeof(PaymentMethod), PaymentMethod)) errors.Add("PaymentMethod Is Defined");

        if (!Enum.IsDefined(typeof(BoostType), Boost)) errors.Add("BoostType Is Defined");

        return errors.Count > 0 ? (false, errors) : (true, null);
    }
}
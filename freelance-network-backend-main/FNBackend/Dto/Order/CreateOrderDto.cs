using FNBackend.Entities.Enums;

namespace FNBackend.Dto.Order;

/// <summary>
/// DTO for creating a new order.
/// </summary>
public class CreateOrderDto
{
    /// <summary>
    /// The title of the order.
    /// </summary>
    public string Title { get; set; } = "";

    public string Tags { get; set; }
    
    /// <summary>
    /// The description of the order.
    /// </summary>
    public string Description { get; set; } = "";

    /// <summary>
    /// The total amount of the order.
    /// </summary>
    public int TotalAmount { get; set; }

    /// <summary>
    /// The currency of the order.
    /// </summary>
    public CurrencyType Currency { get; set; }

    /// <summary>
    /// The payment method for the order.
    /// </summary>
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>
    /// The identifier of the boost associated with the order.
    /// </summary>
    public BoostType Boost { get; set; }
    
    /// <summary>
    /// The identifier of the direction associated with the order.
    /// </summary>
    public Guid DirectionId { get; set; }
    
}
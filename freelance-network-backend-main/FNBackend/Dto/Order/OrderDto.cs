using FNBackend.Entities;
using FNBackend.Entities.Enums;

namespace FNBackend.Dto.Order;

public class OrderDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Default;
    public string Tags { get; set; }
    public CurrencyType Currency { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public BoostType Boost { get; set; }
    public int Views { get; set; }
    public int Responses { get; set; }
    public bool IsFavorite { get; set; }
    public string Direction { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public OrderDto(string title, string description, BoostType boost, string direction)
    {
        Title = title;
        Description = description;
        Boost = boost;
        Direction = direction;
    }

    public OrderDto(EOrder order, bool isFavorite, string title, string description, BoostType boost, string direction)
    {
        Id = order.Id;
        Title = order.Title;
        Description = order.Description;
        TotalAmount = order.TotalAmount;
        Currency = order.Currency;
        IsFavorite = isFavorite;
        Direction = direction;
        Boost = order.Boost;
        Tags = order.Tags;
    }
}
using System.ComponentModel.DataAnnotations.Schema;
using FNBackend.Entities.Base;
using FNBackend.Entities.Enums;

namespace FNBackend.Entities
{
    public class EOrder : IntDataEntity
    {
        public string Title { get; set; } = "-";
        public string Description { get; set; } = "";
        public int TotalAmount { get; set; } = 0;
        public string Tags { get; set; } = "";
        public CurrencyType Currency { get; set; } = CurrencyType.Default;

        public OrderStatus Status { get; set; } = OrderStatus.Default;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Default;
        public BoostType Boost { get; set; } = new();
        
        public Guid DirectionId { get; set; }

        [ForeignKey("DirectionId")]
        public EDirection Direction { get; set; }
        
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public EUser User { get; set; }
        
        public string? PerformerId { get; set; }
        [ForeignKey("PerformerId")]
        public EUser? Performer { get; set; }

        public ICollection<EView> Views { get; set; } = new List<EView>();
        public ICollection<EResponse> Responses { get; set; } = new List<EResponse>();
        public ICollection<EFavoriteOrder> FavoriteOrders { get; set; } = new List<EFavoriteOrder>();

        public DateTime CloseTime { get; set; }
    }
}
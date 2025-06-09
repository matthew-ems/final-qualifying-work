using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class EFavoriteOrder : UserOrderEntity
{
    public DateTime FavoritedAt { get; set; } = DateTime.UtcNow;
}
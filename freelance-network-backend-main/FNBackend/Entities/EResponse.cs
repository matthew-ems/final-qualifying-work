using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class EResponse : UserOrderEntity
{
    public string Message { get; set; } = "-";
}
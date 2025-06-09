using System.ComponentModel;

namespace FNBackend.Entities.Enums;

public enum CurrencyType
{
    [Description("Default")]
    Default = 0,
    [Description("RUB")]
    RUB = 1,
    [Description("EUR")]
    EUR = 2,
    [Description("USD")]
    USD = 3,
    [Description("AED")]
    AED = 4
}
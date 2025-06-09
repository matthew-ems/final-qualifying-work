using System.ComponentModel;

namespace FNBackend.Entities.Enums;

public enum ProfileType
{
    [Description("Customer")]
    Customer = 0,
    [Description("Executor")]
    Executor = 1
}
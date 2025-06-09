using System.ComponentModel;

namespace FNBackend.Entities.Enums;

public enum OrderStatus
{
    [Description("Default")]
    Default = 0,
    [Description("Close")]
    Close = 1,
    [Description("Open")]
    Open = 2,
    [Description("InProgress")]
    InProgress = 3,
    [Description("Done")]
    Done = 4
}
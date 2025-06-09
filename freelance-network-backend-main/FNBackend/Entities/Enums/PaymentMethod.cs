using System.ComponentModel;

namespace FNBackend.Entities.Enums;

public enum PaymentMethod
{
    [Description("Default")] Default = 0,
    [Description("Hour")] Hour = 1,
    [Description("Project")] Project = 2,
    [Description("HourNone")] HourNone = 3,
    [Description("ProjectNone")] ProjectNone = 4
}
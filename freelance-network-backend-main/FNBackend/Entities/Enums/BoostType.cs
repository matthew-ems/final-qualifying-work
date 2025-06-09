using System.ComponentModel;

namespace FNBackend.Entities.Enums;

public enum BoostType
{
    [Description("Default")] Default = 0,

    [Description("Fire")] Fire = 1,

    [Description("Outline")] Outline = 2,

    [Description("Fire OutLine")] FireLine = 3
}
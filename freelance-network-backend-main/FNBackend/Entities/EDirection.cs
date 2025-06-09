using System.ComponentModel.DataAnnotations;
using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class EDirection : DataEntity
{
    [MaxLength(50)] public string Title { get; set; } = "";

    public EDirection(string title)
    {
        Title = title;
    }
}
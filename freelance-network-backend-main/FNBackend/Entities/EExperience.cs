using System.ComponentModel.DataAnnotations;
using FNBackend.Entities.Base;

namespace FNBackend.Entities;

public class EExperience : DataEntity
{
    [MaxLength(50)] public string Title { get; set; }
    
    public EExperience(string title)
    {
        Title = title;
    }
}
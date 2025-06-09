namespace FNBackend.Entities.Base;

public class IntDataEntity
{
    public IntDataEntity()
    {
        CreateDate();
    }

    public IntDataEntity(int id)
    {
        Id = id;
        CreateDate();
    }
    
    public int Id { get; set; }

    private DateTime createdAtSource;

    public DateTime CreatedAt
    {
        get => createdAtSource;
        set => createdAtSource = DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    private DateTime updatedAtSource;

    public DateTime UpdatedAt
    {
        get => updatedAtSource;
        set => updatedAtSource = DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }
    
    public void UpdateDate() =>
        UpdatedAt = DateTime.UtcNow;
    
    public void EditId(int id) =>
        Id = id;

    private void CreateDate()
    {
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
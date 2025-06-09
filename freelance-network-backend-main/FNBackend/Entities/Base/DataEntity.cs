namespace FNBackend.Entities.Base;

public class DataEntity
{
    public DataEntity()
    {
        Id = Guid.NewGuid();
        CreateDate();
    }

    public DataEntity(Guid id)
    {
        Id = id;
        CreateDate();
    }
    
    public Guid Id { get; set; }

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
    
    public void EditId(Guid id) =>
        Id = id;

    private void CreateDate()
    {
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
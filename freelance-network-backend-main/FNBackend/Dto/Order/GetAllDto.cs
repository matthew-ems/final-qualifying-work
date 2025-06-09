namespace FNBackend.Dto.Order;

public class GetAllDto
{
    public int PageSize { get; set; } = 10;
    public int? Cursor { get; set; } = null;
}
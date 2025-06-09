namespace FNBackend.Dto.ControllerDtos;

[Serializable]
public class GetCustomerDto
{
    public string PhotoUrl { get; set; }
    public string Bio { get; set; }
    public string Role { get; set; }
}
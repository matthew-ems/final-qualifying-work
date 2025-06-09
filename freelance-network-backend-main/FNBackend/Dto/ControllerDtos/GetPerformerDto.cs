namespace FNBackend.Dto.ControllerDtos;

[Serializable]
public class GetPerformerDto : GetCustomerDto
{
    public string Experience { get; set; }
    public string Direction { get; set; }
    
    public string Tags { get; set; }
}
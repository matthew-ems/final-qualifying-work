namespace FNBackend.Dto.User;

public class RegisterDto : ProfileDto
{
    public string id { get; set; }
    public string first_name { get; set; }
    public string last_name { get; set; }
    public string username { get; set; }
    public string photo_url { get; set; }
    
    public string language_code { get; set; }
}
namespace FNBackend.Middlewares.Attributes;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public class JwtAuthorizeAttribute : Attribute
{
    public string? Role { get; set; } = string.Empty;
}

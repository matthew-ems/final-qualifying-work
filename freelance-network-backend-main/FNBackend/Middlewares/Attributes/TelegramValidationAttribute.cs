namespace FNBackend.Middlewares.Attributes;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public class TelegramValidationAttribute : Attribute
{
    
}
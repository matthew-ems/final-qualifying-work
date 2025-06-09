using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FNBackend.Middlewares.Swagger;

public class AddRequiredHeaderParameter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var hasTelegramValidationAttribute = context.MethodInfo.GetCustomAttributes(typeof(TelegramValidationAttribute), true).Any();
        var hasJwtAuthorize = context.MethodInfo.GetCustomAttributes(typeof(JwtAuthorizeAttribute), true).Any();
        
        if (hasTelegramValidationAttribute && Env.ENVIRONMENT != Enviroment.Development)
        {
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = Headers.TelegramHeader,
                In = ParameterLocation.Header,
                Required = true,
                Schema = new OpenApiSchema
                {
                    Type = "string"
                },
                Description = $"Custom Telegram header in the format '{Headers.TelegramDataType} initData...'"
            });

            operation.Description += hasTelegramValidationAttribute
                ? "📲 Needed Telegram init data.\r\n"
                : "❌ Not needed Telegram init data.\r\n";
        }

        string needText = "🔒 Needed JWT Token.<br>";
        
        if (hasJwtAuthorize)
        {
            var jwtAuthorizeAttribute = context.MethodInfo.GetCustomAttributes(typeof(JwtAuthorizeAttribute), true);
            
            var jwtAuthorize = jwtAuthorizeAttribute[0] as JwtAuthorizeAttribute;
        
            needText = $"🔒 Needed JWT Token[{jwtAuthorize?.Role}].<br>";
        }
        
        operation.Description += hasJwtAuthorize ? needText : "❌ Not need JWT Token.<br>";
    }
}

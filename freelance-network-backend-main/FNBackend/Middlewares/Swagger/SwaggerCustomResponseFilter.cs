using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FNBackend.Middlewares.Swagger;

public class SwaggerCustomResponseFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var jwtAuthorize = context.MethodInfo.GetCustomAttributes(typeof(JwtAuthorizeAttribute), true).Any();
        var telegramValidation =
            context.MethodInfo.GetCustomAttributes(typeof(TelegramValidationAttribute), true).Any();

        if (jwtAuthorize)
        {
            operation.Responses.Add("401", new OpenApiResponse
            {
                Description = "Unauthorized"
            });
            operation.Responses.Add("403", new OpenApiResponse
            {
                Description = "Forbidden"
            });
        }

        if (telegramValidation && Env.ENVIRONMENT != Enviroment.Development)
        {
            operation.Responses.Add("406", new OpenApiResponse
            {
                Description = "Don't have a telegram data"
            });
        }
    }
}

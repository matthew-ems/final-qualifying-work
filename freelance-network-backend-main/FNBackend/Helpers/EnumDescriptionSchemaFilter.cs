using System.ComponentModel;
using System.Reflection;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FNBackend.Helpers;

public class EnumDescriptionSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type.IsEnum)
        {
            var enumType = context.Type;
            schema.Enum.Clear();

            var enumValues = Enum.GetValues(enumType).Cast<Enum>().Select(e =>
                new OpenApiString($"{Convert.ToInt32(e)} - {GetEnumDescription(e)}")).ToList();

            foreach (var enumValue in enumValues)
            {
                schema.Enum.Add(enumValue);
            }
        }
    }

    private string GetEnumDescription(Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = field.GetCustomAttribute<DescriptionAttribute>();

        return attribute?.Description ?? value.ToString();
    }
}
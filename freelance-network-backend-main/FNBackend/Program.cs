using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using FNBackend.Context;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Logging;
using FNBackend.Middlewares;
using FNBackend.Middlewares.Swagger;
using FNBackend.Services;
using FNBackend.Services.Implementation;
using FNBackend.Services.Interfaces;
using FNBackend.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace FNBackend;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        Env.InitEnvs(builder.Configuration);
        
        builder.Services.AddControllers();
        
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAllOrigins", builder =>
            {
                builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });
        
        builder.Services.AddEndpointsApiExplorer();
        
        #region Swagger

        if (Env.ENVIRONMENT != Enviroment.Production)
        {
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v2", new OpenApiInfo { Title = "FN API", Version = "v2" });

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            
                c.IncludeXmlComments(xmlPath);

                c.OperationFilter<SwaggerCustomResponseFilter>();
                
                c.EnableAnnotations();
                c.SchemaFilter<EnumDescriptionSchemaFilter>();
            
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                  Enter 'Bearer' [space] and then your token in the text input below.
                  \r\n\r\nExample: 'Bearer 12345abcdef'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = Headers.TokenType
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = Headers.TokenType
                            },
                            Scheme = Headers.TokenType,
                            Name = "Authorization",
                            In = ParameterLocation.Header,
                        },
                        new List<string>()
                    }
                });
            
                c.OperationFilter<AddRequiredHeaderParameter>();
            });
        }

        #endregion

        string connectionString = $"User ID={Env.DB_USER};" +
                                  $"Password={Env.DB_PASSWORD};" +
                                  $"Host={Env.DB_HOST};" +
                                  $"Port={Env.DB_PORT};" +
                                  $"Database={Env.DB_DATABASE};" +
                                  $"Pooling={Env.DB_POOLING};";

        builder.Services.AddDbContext<ApplicationDb>(options =>
            options.UseNpgsql(connectionString));

        var loggingTagsSection = builder.Configuration.GetSection("Logging:Tags");
        LoggingTagsOptions.INFO = loggingTagsSection.GetValue<bool>("INFO");
        LoggingTagsOptions.DEBUG = loggingTagsSection.GetValue<bool>("DEBUG");
        LoggingTagsOptions.ERROR = loggingTagsSection.GetValue<bool>("ERROR");
        LoggingTagsOptions.WARN = loggingTagsSection.GetValue<bool>("WARN");
        LoggingTagsOptions.CRITICAL = loggingTagsSection.GetValue<bool>("CRITICAL");
        
        builder.Services.AddLogging(builder =>
        {
            builder.ClearProviders();
            builder.AddProvider(new TurboLoggerProvider());
        });

        builder.Services.AddSingleton<TelegramService>();
        builder.Services.AddSingleton<TokenCache>();
        
        builder.Services.AddScoped<IJwt, JwtService>();
        builder.Services.AddScoped<IProfile, ProfileService>();
        builder.Services.AddScoped<IPayLoadEncoder, PayLoadEncoder>();
        
        builder.Services.AddIdentity<EUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDb>()
            .AddDefaultTokenProviders();
        
        var app = builder.Build();
        
        using var scope = app.Services.CreateScope();
        
        var services = scope.ServiceProvider;

        try
        {
            var db = services.GetRequiredService<ApplicationDb>();

            var name = db.Database.GetConnectionString();
            app.Logger.LogInformation("[Database] Connection String: {S}", name);

            foreach (var migration in db.Database.GetMigrations())
                app.Logger.LogInformation("Migration: {S}", migration);

            await db.Database.MigrateAsync();
            
            app.Logger.LogInformation("Migrations and database check completed...");
            
            app.Logger.LogInformation("We begin the necessary work with the database");
            
            app.Logger.LogInformation("Creating roles...");
            
            await ContextHelpers.CreateRolesAsync(services);
            
            app.Logger.LogInformation("Creating default directions...");
            
            await ContextHelpers.CreateDefaultDirections(db);
            
            app.Logger.LogInformation("Creating default Experiences...");

            await ContextHelpers.CreateDefaultExperience(db);
            
            app.Logger.LogInformation("Creating admin user...");
            
            await ContextHelpers.CreateAdminUser(services);
            
            app.Logger.LogInformation("Necessary work with the database has been completed.");
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        }

        if (Env.ENVIRONMENT != Enviroment.Production)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v2/swagger.json", "FN.API.V2");
            });
        }

        app.UseCors("AllowAllOrigins");
        app.UseHttpsRedirection();
        app.UseMiddleware<TokenValidationMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        
        await app.RunAsync();
    }
}
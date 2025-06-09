namespace FNBackend.Helpers;

public enum Enviroment
{
    Development = 0,
    Staging = 1,
    Production = 2,
    Local = 3
}

public static class Env
{
    public static Enviroment ENVIRONMENT { get; private set; }
    public static string DB_USER { get; private set; }
    public static string DB_PASSWORD { get; private set; }
    public static string DB_HOST { get; private set; }
    public static string DB_PORT { get; private set; }
    public static string DB_DATABASE { get; private set; }
    public static string DB_POOLING { get; private set; }
    public static string BOT_TOKEN { get; private set; }
    public static int MAX_CACHE { get; private set; }
    public static DateTime ACCESS_TOKEN_EXP => GetTimeStamp(_accessTokenString);
    public static DateTime REFRESH_TOKEN_EXP => GetTimeStamp(_refreshTokenString);

    private static string[] _accessTokenString;
    private static string[] _refreshTokenString;
    
    public static void InitEnvs(ConfigurationManager config)
    {
        switch (config["ASPNETCORE_ENVIRONMENT"])
        {
            case "Development":
                ENVIRONMENT = Enviroment.Development;
                break;
            case "Staging":
                ENVIRONMENT = Enviroment.Staging;
                break;
            case "Production":
                ENVIRONMENT = Enviroment.Production;
                break;
        }
        
        DB_USER = config["ASPNETCORE_DB_USER"];
        DB_PASSWORD = config["ASPNETCORE_DB_PASSWORD"];
        DB_HOST = config["ASPNETCORE_DB_HOST"];
        DB_PORT = config["ASPNETCORE_DB_PORT"];
        DB_DATABASE = config["ASPNETCORE_DB_DATABASE"];
        DB_POOLING = config["ASPNETCORE_DB_POOLING"];
        BOT_TOKEN = config["ASPNETCORE_BOT_TOKEN"];
        MAX_CACHE = Convert.ToInt32(config["ASPNETCORE_MAX_CACHE"]);
        
        _accessTokenString = config["ASPNETCORE_ACCESS_TOKEN_EXP"].Split(":");
        _refreshTokenString = config["ASPNETCORE_REFRESH_TOKEN_EXP"].Split(":");
    }

    private static DateTime GetTimeStamp(string[] fullString)
    {
        var value = Convert.ToDouble(fullString.Last());

        return fullString.First() switch
        {
            "m" => DateTime.UtcNow.AddMinutes(value),
            "h" => DateTime.UtcNow.AddHours(value),
            "d" => DateTime.UtcNow.AddDays(value),
            _ => DateTime.UtcNow.AddMinutes(30)
        };
    }
}
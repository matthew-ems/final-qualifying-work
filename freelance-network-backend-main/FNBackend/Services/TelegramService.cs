using System.Collections.Specialized;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using FNBackend.Helpers;

namespace FNBackend.Services;

public class TelegramService
{
    private readonly ILogger<TelegramService> _logger;
    
    public TelegramService(ILogger<TelegramService> logger)
    {
        _logger = logger;
    }

    public bool ValidateInitData(string initData)
    {
        if (!GetNameValueCollection(initData, out var data))
            return false;

        if (!IsAuthDateValid(data))
            return false;

        var hash = data["hash"];
        data.Remove("hash");

        var checkString = string.Join("\n", data.AllKeys.OrderBy(key => key).Select(key => $"{key}={data[key]}"));
        var hmacKey = new HMACSHA256(Encoding.UTF8.GetBytes("WebAppData"));
        var secretKey = hmacKey.ComputeHash(Encoding.UTF8.GetBytes(Env.BOT_TOKEN));
        var hashKey = new HMACSHA256(secretKey);
        var hashBytes = hashKey.ComputeHash(Encoding.UTF8.GetBytes(checkString));
        var computedHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        return computedHash.Equals(hash);
    }

    private bool GetNameValueCollection(string initData, out NameValueCollection data)
    {
        data = null!;
        
        if (initData.Contains(Headers.TelegramDataType))
            initData = initData.Split(" ").Last();
        
        if (string.IsNullOrEmpty(Env.BOT_TOKEN))
        {
            _logger.LogError("Bot key is not set");

            return false;
        }
        
        _logger.LogInformation("Validating init data");
        
        data = HttpUtility.ParseQueryString(initData);

        return true;
    }
    
    private static bool IsAuthDateValid(NameValueCollection collaction)
    {
        if (!long.TryParse(collaction["auth_date"], out long authDateTimestamp))
            return false;

        var authDate = DateTimeOffset.FromUnixTimeSeconds(authDateTimestamp).UtcDateTime;
        var expirationTime = authDate.AddHours(24);

        return DateTime.UtcNow < expirationTime;
    }
}
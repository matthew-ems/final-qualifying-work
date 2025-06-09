using System.Security.Cryptography;
using FNBackend.Services.Interfaces;

namespace FNBackend.Services.Implementation;

public class PayLoadEncoder : IPayLoadEncoder
{
    private string EncryptionKey;
    private byte[] Key => Convert.FromBase64String(EncryptionKey);

    public PayLoadEncoder(IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        
        EncryptionKey = jwtSettings["PyLoadKey"];
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="plainTData"></param>
    /// <returns></returns>
    public string EncryptPayLoad(string plainTData)
    {
        using var aes = Aes.Create();
        aes.Key = Key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();

        ms.Write(aes.IV, 0, aes.IV.Length);

        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
            using var sw = new StreamWriter(cs);
            sw.Write(plainTData);
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="encryptedData"></param>
    /// <returns></returns>
    public string DecryptPayLoad(string encryptedData)
    {
        var fullCipher = Convert.FromBase64String(encryptedData);

        using var aes = Aes.Create();
        aes.Key = Key;

        var iv = new byte[aes.BlockSize / 8];
        Array.Copy(fullCipher, 0, iv, 0, iv.Length);
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

        using var ms = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length);
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);

        return sr.ReadToEnd();
    }
}
    
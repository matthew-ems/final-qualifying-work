namespace FNBackend.Services.Interfaces;

public interface IPayLoadEncoder
{
    string EncryptPayLoad(string plainTData);

    string DecryptPayLoad(string encryptedData);
}
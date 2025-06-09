namespace FNBackend.Logging;

public class TurboLoggerProvider : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName)
    {
        return new TurboLogger(categoryName);
    }

    public void Dispose()
    {
        
    }
}
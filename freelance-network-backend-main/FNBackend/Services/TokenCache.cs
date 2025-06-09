using FNBackend.Context;
using FNBackend.Helpers;

namespace FNBackend.Services;

public class TokenCache
{
    private readonly Dictionary<string, LinkedListNode<(string Key, string Value)>> _cache;
    private readonly LinkedList<(string Key, string Value)> _lruList;
    private readonly ReaderWriterLockSlim _cacheLock = new();
    private readonly ILogger<TokenCache> _logger;
    private readonly IServiceProvider _serviceProvider;

    public TokenCache(ILogger<TokenCache> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;

        _cache = new Dictionary<string, LinkedListNode<(string Key, string Value)>>();
        _lruList = new LinkedList<(string Key, string Value)>();
    }

    /// <summary>
    /// Getting a personal key by user ID
    /// </summary>
    /// <param name="key">This is the user ID</param>
    /// <param name="value">Personal key for JWT</param>
    /// <returns>If value has it true</returns>
    public bool TryGet(string key, out string value)
    {
        value = string.Empty;
        
        _cacheLock.EnterUpgradeableReadLock();
        try
        {
            if (_cache.TryGetValue(key, out var node))
            {
                _cacheLock.EnterWriteLock();
                try
                {
                    _lruList.Remove(node);
                    _lruList.AddFirst(node);
                }
                finally
                {
                    _cacheLock.ExitWriteLock();
                }

                value = node.Value.Value;
                return true;
            }
            
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDb>();

            var token = dbContext.UserKeys.FirstOrDefault(t => t.UserId == key);
            
            _logger.LogInformation("Find key in database");
            
            if (token != null)
            {
                Put(key, token.EncryptKey);
                value = token.EncryptKey;
                return true;
            }

            return false;
        }
        finally
        {
            _cacheLock.ExitUpgradeableReadLock();
        }
    }

    /// <summary>
    /// Write or update record
    /// </summary>
    /// <param name="key">This is the user ID</param>
    /// <param name="value">Personal key for JWT</param>
    public void Put(string key, string value)
    {
        _cacheLock.EnterWriteLock();
        try
        {
            if (_cache.ContainsKey(key))
            {
                var node = _cache[key];
                _lruList.Remove(node);
                _lruList.AddFirst(new LinkedListNode<(string Key, string Value)>((key, value)));
                _cache[key] = _lruList.First;
            }
            else
            {
                if (_cache.Count >= Env.MAX_CACHE)
                {
                    var lastNode = _lruList.Last;
                    _lruList.RemoveLast();
                    _cache.Remove(lastNode.Value.Key);
                }

                var newNode = new LinkedListNode<(string Key, string Value)>((key, value));
                _lruList.AddFirst(newNode);
                _cache[key] = newNode;
            }
        }
        finally
        {
            _cacheLock.ExitWriteLock();
        }
    }

    /// <summary>
    /// Checking for the existence of a key
    /// </summary>
    /// <param name="key">This is the user ID</param>
    /// <returns>If it contains, then it is true</returns>
    public bool ContainsKey(string key)
    {
        _cacheLock.EnterReadLock();
        try
        {
            return _cache.ContainsKey(key);
        }
        finally
        {
            _cacheLock.ExitReadLock();
        }
    }

    /// <summary>
    /// Clear all arrays
    /// </summary>
    public void ClearAll()
    {
        _cacheLock.EnterWriteLock();
        try
        {
            _cache.Clear();
            _lruList.Clear();
        }
        finally
        {
            _cacheLock.ExitWriteLock();
        }
    }

    /// <summary>
    /// Getting records count
    /// </summary>
    public int Count()
    {
        _cacheLock.EnterReadLock();
        try
        {
            return _cache.Count;
        }
        finally
        {
            _cacheLock.ExitReadLock();
        }
    }
}
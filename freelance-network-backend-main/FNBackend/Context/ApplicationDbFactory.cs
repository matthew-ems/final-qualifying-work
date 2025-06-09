using FNBackend.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FNBackend;

public class ApplicationDbFactory : IDesignTimeDbContextFactory<ApplicationDb>
{
    public ApplicationDb CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDb>();
        
        var connectionString = "Host=localhost;Port=5432;Database=audit;Username=local;Password=pass";
        
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDb(optionsBuilder.Options);
    }
}
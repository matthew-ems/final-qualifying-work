using FNBackend.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Context;

public class ApplicationDb : IdentityDbContext<EUser>
{
    public ApplicationDb(DbContextOptions<ApplicationDb> options)
        : base(options)
    { }
    
    public DbSet<EDirection> Directions { get; set; }
    public DbSet<EExperience> Experiences { get; set; }
    public DbSet<EFavoriteOrder> FavoriteOrders { get; set; }
    public DbSet<EOrder> Orders { get; set; }
    public DbSet<EProfileInfo> ProfileInfos { get; set; }
    public DbSet<EResponse> Responses { get; set; }
    public DbSet<EView> Views { get; set; }
    public DbSet<EReview> Reviews { get; set; }
    public DbSet<ERefreshToken> RefreshTokens { get; set; }
    public DbSet<EUserKeys> UserKeys { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        #region Profile info
        
        modelBuilder.Entity<EProfileInfo>()
            .HasOne(p => p.Direction)
            .WithMany()
            .HasForeignKey(p => p.DirectionId);
        
        modelBuilder.Entity<EProfileInfo>()
            .HasOne(p => p.User)
            .WithMany(u => u.ProfileInfos)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion
        
        #region Reviews

        modelBuilder.Entity<EReview>()
            .HasKey(r => new { r.AuthorId, r.OrderId, r.TargetUserId });

        #endregion

        #region Order

        modelBuilder.Entity<EOrder>()
            .Property(e => e.Id)
            .ValueGeneratedOnAdd();
        
        modelBuilder.Entity<EOrder>()
            .HasOne(p => p.Direction)
            .WithMany()
            .HasForeignKey(p => p.DirectionId);
        
        #endregion

        #region Views

        modelBuilder.Entity<EView>()
            .HasKey(e => new { e.UserId, e.OrderId });
        
        modelBuilder.Entity<EView>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId);

        modelBuilder.Entity<EView>()
            .HasOne(f => f.Order)
            .WithMany(o => o.Views)
            .HasForeignKey(f => f.OrderId);

        #endregion
        
        #region Responses

        modelBuilder.Entity<EResponse>()
            .HasKey(e => new { e.UserId, e.OrderId });
        
        modelBuilder.Entity<EResponse>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId);

        modelBuilder.Entity<EResponse>()
            .HasOne(f => f.Order)
            .WithMany(o => o.Responses)
            .HasForeignKey(f => f.OrderId);

        #endregion
        
        #region Favorites

        modelBuilder.Entity<EFavoriteOrder>()
            .HasKey(e => new { e.UserId, e.OrderId });

        modelBuilder.Entity<EFavoriteOrder>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId);

        modelBuilder.Entity<EFavoriteOrder>()
            .HasOne(f => f.Order)
            .WithMany(o => o.FavoriteOrders)
            .HasForeignKey(f => f.OrderId);

        #endregion

        #region Indexes, Query acceleration
        
        /*modelBuilder.Entity<EFavoriteOrder>()
            .HasIndex(f => f.UserId)
            .HasDatabaseName("IX_FavoriteOrders_UserId");

        modelBuilder.Entity<EFavoriteOrder>()
            .HasIndex(f => f.OrderId)
            .HasDatabaseName("IX_FavoriteOrders_OrderId");

        modelBuilder.Entity<EOrder>()
            .HasIndex(o => o.Status)
            .HasDatabaseName("IX_Orders_Status");

        modelBuilder.Entity<EOrder>()
            .HasIndex(o => o.BoostId)
            .HasDatabaseName("IX_Orders_BoostId");

        modelBuilder.Entity<EOrder>()
            .HasIndex(o => o.DirectionId)
            .HasDatabaseName("IX_Orders_DirectionId");

        modelBuilder.Entity<EOrder>()
            .HasIndex(o => o.CloseTime)
            .HasDatabaseName("IX_Orders_CloseTime");

        modelBuilder.Entity<EProfileInfo>()
            .HasIndex(p => p.ExperienceId)
            .HasDatabaseName("IX_ProfileInfos_ExperienceId");

        modelBuilder.Entity<EProfileInfo>()
            .HasIndex(p => p.DirectionId)
            .HasDatabaseName("IX_ProfileInfos_DirectionId");*/

        #endregion
        
        base.OnModelCreating(modelBuilder);
    }
}
using FNBackend.Context;
using FNBackend.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Helpers;

public static class ContextHelpers
{
    private const string AdminId = "G5FHJFG890H5ERGUHG459H56HJRTG";
    
    public static async Task CreateRolesAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        string[] roleNames = { Roles.Admin, Roles.Customer, Roles.Performer };

        foreach (var roleName in roleNames)
        {
            var roleExist = await roleManager.RoleExistsAsync(roleName);
            
            if (!roleExist)
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }

    public static async Task CreateDefaultDirections(ApplicationDb context)
    {
        foreach (var direction in Directions.AllDirections)
        {
            var directionExist = await context.Directions.FirstOrDefaultAsync(d => d.Title == direction);

            if (directionExist == null)
            {
                await context.Directions.AddAsync(new EDirection(direction));
            }
        }

        await context.SaveChangesAsync();
    }

    public static async Task CreateDefaultExperience(ApplicationDb context)
    {
        foreach (var experience in Experience.AllExperience)
        {
            var experienceExist = await context.Experiences.FirstOrDefaultAsync(d => d.Title == experience);

            if (experienceExist == null)
            {
                await context.Experiences.AddAsync(new EExperience(experience));
            }
        }

        await context.SaveChangesAsync();
    }
    
    public static async Task CreateAdminUser(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<EUser>>();

        var userExisting = await userManager.FindByIdAsync(AdminId);
        
        if (userExisting != null)
        {
            return;
        }

        EUser adminUser = new();

        adminUser.Id = AdminId;
        adminUser.FirstName = "Application";
        adminUser.LastName = "Administrator";
        adminUser.UserName = "Admin";
        
        await userManager.CreateAsync(adminUser);
        
        await userManager.AddToRoleAsync(adminUser, Roles.Admin);
    }
}
using FNBackend.Context;
using FNBackend.Dto.ControllerDtos;
using FNBackend.Dto.Small;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/experience")]
public class ExperienceController : ControllerBase
{
    private readonly ApplicationDb _applicationDb;
    private readonly DbSet<EExperience> _dbSet;

    public ExperienceController(ApplicationDb applicationDb)
    {
        _applicationDb = applicationDb;

        _dbSet = _applicationDb.Experiences;
    }
    
    [HttpGet("get/{experienceId}")]
    [JwtAuthorize]
    public async Task<IActionResult> Get(Guid experienceId)
    {
        var experience = await _dbSet.Where(b => b.Id == experienceId).FirstOrDefaultAsync();

        if (experience == default)
            return NotFound("No record was found");

        GetIdTitleDto experienceDto = new()
        {
            Id = experience.Id.ToString(),
            Title = experience.Title
        };

        return Ok(experienceDto);
    }
    
    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var experiences = await _dbSet.ToListAsync();
        
        if (experiences.Count <= 0)
            return NotFound("No record was found");

        List<GetIdTitleDto> experienceDtos = new();
        
        foreach (var experience in experiences)
        {
            experienceDtos.Add(new GetIdTitleDto
            {
                Title = experience.Title,
                Id = experience.Id.ToString()
            });
        }
        
        return Ok(experienceDtos);
    }
    
    [HttpPost("create")]
    [JwtAuthorize(Role = Roles.Admin)]
    public async Task<IActionResult> Create([FromBody] TitleDto titleDto)
    {
        var duplicate = await _dbSet.Select(b => b.Title == titleDto.Title).FirstOrDefaultAsync();

        if (duplicate)
            return Conflict("There's already a record like this");

        EExperience newExperience = new(titleDto.Title);
        
        await _dbSet.AddAsync(newExperience);

        await _applicationDb.SaveChangesAsync();

        return Ok("The record was successfully created");
    }

    [HttpPut("update/{experienceId}")]
    [JwtAuthorize(Role = Roles.Admin)]
    public async Task<IActionResult> Update(Guid experienceId, [FromBody] TitleDto titleDto)
    {
        var experience = await _dbSet.Where(b => b.Id == experienceId).FirstOrDefaultAsync();
        
        if (experience == default)
            return NotFound("No record was found");

        experience.Title = titleDto.Title;
        
        _dbSet.Update(experience);

        await _applicationDb.SaveChangesAsync();

        return Ok("Updated");
    }

    [HttpDelete("delete/{experienceId}")]
    [JwtAuthorize(Role = Roles.Admin)]
    public async Task<IActionResult> Delete(Guid experienceId)
    {
        var experience = await _dbSet.Where(b => b.Id == experienceId).FirstOrDefaultAsync();
        
        if (experience == default)
            return NotFound("No record was found");

        _dbSet.Remove(experience);
        
        await _applicationDb.SaveChangesAsync();
        
        return Ok("Deleted");
    }
}
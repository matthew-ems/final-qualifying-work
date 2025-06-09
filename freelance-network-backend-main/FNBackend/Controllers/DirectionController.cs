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
[Route($"{Http.RouteBase}/directions")]
public class DirectionController : ControllerBase
{
    private readonly ApplicationDb _applicationDb;
    private readonly DbSet<EDirection> _dbSet;

    public DirectionController(ApplicationDb applicationDb)
    {
        _applicationDb = applicationDb;

        _dbSet = _applicationDb.Directions;
    }
    
    [HttpGet("get/{directionId}")]
    [JwtAuthorize]
    public async Task<IActionResult> Get(Guid directionId)
    {
        var direction = await _dbSet.Where(b => b.Id == directionId).FirstOrDefaultAsync();

        if (direction == default)
            return NotFound("No record was found");

        GetIdTitleDto directionDto = new()
        {
            Id = direction.Id.ToString(),
            Title = direction.Title
        };

        return Ok(directionDto);
    }
    
    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var directions = await _dbSet.ToListAsync();
        
        if (directions.Count <= 0)
            return NotFound("No record was found");

        List<GetIdTitleDto> directionDtos = new();
        
        foreach (var direction in directions)
        {
            directionDtos.Add(new GetIdTitleDto
            {
                Title = direction.Title,
                Id = direction.Id.ToString()
            });
        }
        
        return Ok(directionDtos);
    }
    
    [HttpPost("create")]
    [JwtAuthorize(Role = Roles.Admin)]
    public async Task<IActionResult> Create([FromBody] TitleDto titleDto)
    {
        var duplicate = await _dbSet.Select(b => b.Title == titleDto.Title).FirstOrDefaultAsync();

        if (duplicate)
            return Conflict("There's already a record like this");

        EDirection newDirection = new(titleDto.Title);
        
        await _dbSet.AddAsync(newDirection);

        await _applicationDb.SaveChangesAsync();

        return Ok("The record was successfully created");
    }

    [HttpPut("update/{directionId}")]
    [JwtAuthorize(Role = Roles.Admin)]
    public async Task<IActionResult> Update(Guid directionId, [FromBody] TitleDto titleDto)
    {
        var direction = await _dbSet.Where(b => b.Id == directionId).FirstOrDefaultAsync();
        
        if (direction == default)
            return NotFound("No record was found");

        direction.Title = titleDto.Title;
        
        _dbSet.Update(direction);

        await _applicationDb.SaveChangesAsync();

        return Ok("Updated");
    }

    [HttpDelete("delete/{directionId}")]
    [JwtAuthorize(Role = Roles.Admin)]
    public async Task<IActionResult> Delete(Guid directionId)
    {
        var direction = await _dbSet.Where(b => b.Id == directionId).FirstOrDefaultAsync();
        
        if (direction == default)
            return NotFound("No record was found");

        _dbSet.Remove(direction);
        
        await _applicationDb.SaveChangesAsync();
        
        return Ok("Deleted");
    }
}
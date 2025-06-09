using System.Security.Claims;
using FNBackend.Context;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/favorite")]
public class FavoriteController : ControllerBase
{
    private readonly ApplicationDb _context;

    public FavoriteController(ApplicationDb context)
    {
        _context = context;
    }
    
    /// <summary>
    /// Add order to favorite
    /// </summary>
    /// <param name="orderId">Id of order</param>
    /// <response code="500">Internal error</response>
    /// <response code="409">Already added</response>
    /// <response code="200">Order successfl added to favorite</response>
    [HttpPost("add-to-favorite/{orderId}")]
    [JwtAuthorize]
    public async Task<IActionResult> AddToFavorite([FromRoute] int orderId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return StatusCode(500, "Error adding order to favorites user is null");

        try
        {
            var existingFavorite = await GetFavoriteOrder(userId, orderId);

            if (existingFavorite != null)
            {
                return Conflict("Order already added to favorites.");
            }

            var favoriteOrder = new EFavoriteOrder
            {
                UserId = userId,
                OrderId = orderId,
                FavoritedAt = DateTime.UtcNow
            };

            _context.FavoriteOrders.Add(favoriteOrder);

            await _context.SaveChangesAsync();

            return Ok("Order added to favorites successfully.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error adding order to favorites: {ex.Message}");
        }
    }

    /// <summary>
    /// Заебался писать описание пусть будет так
    /// </summary>
    /// <param name="orderId">Id of order</param>
    /// <response code="500">Internal error</response>
    /// <response code="409">Already added</response>
    /// <response code="200">Order successfl removed to favorite</response>
    /// <response code="404">Order not found</response>
    [HttpPost("remove-from-favorite/{orderId}")]
    [JwtAuthorize]
    public async Task<IActionResult> RemoveFromFavorite(int orderId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return StatusCode(500, "Error removing order to favorites user is null");
        
        try
        {
            var favoriteOrder = await GetFavoriteOrder(userId, orderId);

            if (favoriteOrder == null)
            {
                return NotFound("Favorite order not found.");
            }

            _context.FavoriteOrders.Remove(favoriteOrder);

            await _context.SaveChangesAsync();

            return Ok("Order removed from favorites successfully.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error removing order from favorites: {ex.Message}");
        }
    }
    
    /// <summary>
    /// Заебался писать описание пусть будет так
    /// </summary>
    /// <response code="500">Internal error</response>
    /// <response code="200">Orders list</response>
    /// <response code="409">Already added</response>
    /// <response code="404">Order not found</response>
    [HttpGet("get-favorite-orders")]
    [JwtAuthorize]
    public async Task<IActionResult> GetFavoriteOrders()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return StatusCode(500, "Error getting orders to favorites user is null");
        
        try
        {
            var orders = await _context.FavoriteOrders
                .Where(f => f.UserId == userId)
                .Include(f => f.Order)
                .Select(f => f.Order)
                .ToListAsync();

            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting orders from favorites: {ex.Message}");
        }
    }

    private async Task<EFavoriteOrder?> GetFavoriteOrder(string userId, int orderId)
    {
        var favorite = await _context.FavoriteOrders
            .Where(f => f.UserId == userId && f.OrderId == orderId)
            .FirstOrDefaultAsync();

        return favorite;
    }
}
using System.Security.Claims;
using FNBackend.Context;
using FNBackend.Dto.Responce;
using FNBackend.Entities;
using FNBackend.Entities.Enums;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/responses")]
public class ResponseController : ControllerBase
{
    private readonly ApplicationDb _context;
    private readonly ILogger<ResponseController> _logger;

    public ResponseController(ApplicationDb context, ILogger<ResponseController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get responses to your order
    /// </summary>
    /// <param name="orderId">Order Id</param>
    /// <response code="200">Return responses</response>
    /// <response code="404">Order not found</response>
    [HttpGet("get-for-order/{orderId}")]
    [JwtAuthorize(Role = Roles.Customer)]
    public async Task<IActionResult> GetResponsesForOrder([FromRoute] int orderId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var order = await _context.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order == null)
        {
            return NotFound("Order not found or you don't have access to this order.");
        }

        var responses = await _context.Responses
            .AsNoTracking()
            .Where(o => o.OrderId == orderId)
            .Select(r => new
            {
                Messsage = r.Message,
                UserId = r.UserId
            })
            .ToListAsync();
        
        return Ok(responses);
    }

    /// <summary>
    /// Get all orders that the user responded to
    /// </summary>
    /// <response code="200">Returns all orders to which the user responded</response>
    /// <response code="404">Profile not found or no responses</response>
    [HttpGet("get-for-user")]
    [JwtAuthorize(Role = Roles.Performer)]
    public async Task<IActionResult> GetUserResponses()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var responses = await _context.Responses
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .Include(r => r.Order)
            .ThenInclude(o => o.Views)
            .Include(r => r.Order.Responses)
            .Select(r => new
            {
                OrderId = r.Order.Id,
                Title = r.Order.Title,
                Description = r.Order.Description,
                Status = r.Order.Status,
                ViewsCount = r.Order.Views.Count,
                ResponsesCount = r.Order.Responses.Count,
                Date = r.CreatedAt,
                Tags = r.Order.Tags,
                TotalAmount = r.Order.TotalAmount,
                IsFavorite = r.Order.FavoriteOrders.Any(f => f.UserId == userId),
                CloseTime = (r.Order.Status == OrderStatus.Done || r.Order.Status == OrderStatus.Close) 
                    ? (DateTime?)r.Order.CloseTime 
                    : null
            })
            .ToListAsync();

        if (responses.Count <= 0)
        {
            return NotFound("User not found or you don't have responses");
        }

        return Ok(responses);
    }

    /// <summary>
    /// Create a response to an order via the selected profile
    /// </summary>
    /// <param name="orderId">Order number</param>
    /// <param name="dto">DTO for message and profile processing </param>
    /// <response code="200">Response created</response>
    /// <response code="409">Not enough responses</response>
    /// <response code="404">There is no order with this ID</response>
    /// <response code="400">Profile or user not found</response>
    [HttpPost("create/{orderId}")]
    [JwtAuthorize(Role = Roles.Performer)]
    public async Task<IActionResult> CreateResponse([FromRoute] int orderId, [FromBody] CreateResponseDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.ProfileInfos)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return BadRequest("User not found.");
        }

        var profile = user.ProfileInfos.FirstOrDefault(p => p.Role == Roles.Performer);

        if (profile == null)
        {
            return BadRequest("Profile not found. How did you even get here without a profile?");
        }

        ResetFreeResponsesIfNeeded(profile);

        if (profile.RemainingFreeResponses > 0)
        {
            profile.RemainingFreeResponses--;
        }
        else if (profile.BonusResponses > 0)
        {
            profile.BonusResponses--;
        }
        else
        {
            return Conflict($"You don't have enough responses left. {profile.RemainingFreeResponses}/{profile.FreeResponsesPerDay + profile.BonusResponses}");
        }

        var order = await _context.Orders.FindAsync(orderId);

        if (order == null)
        {
            return NotFound($"Order not found. Where did you even get this ID [{orderId}]?");
        }

        var response = new EResponse
        {
            UserId = user.Id,
            OrderId = order.Id,
            Message = dto.Message
        };

        _context.Responses.Add(response);
        
        await _context.SaveChangesAsync();

        return Ok("Response successfully created.");
    }

    /// <summary>
    /// Reset responses for a profile if a day has passed
    /// </summary>
    /// <param name="profile">User profile</param>
    private void ResetFreeResponsesIfNeeded(EProfileInfo profile)
    {
        var currentTime = DateTime.UtcNow;
        
        if (currentTime.Date > profile.LastResponseReset.Date)
        {
            profile.RemainingFreeResponses = profile.FreeResponsesPerDay;
            profile.LastResponseReset = currentTime;
        }
    }
}

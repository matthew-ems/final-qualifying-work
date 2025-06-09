using System.Security.Claims;
using FNBackend.Context;
using FNBackend.Dto.Review;
using FNBackend.Entities;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/review")]
public class ReviewController : ControllerBase
{
    private readonly ApplicationDb _context;

    public ReviewController(ApplicationDb context)
    {
        _context = context;
    }
    
    /// <summary>
    /// Creating review
    /// </summary>
    /// <param name="request">The data transfer object containing the details of the order to create.</param>
    /// <response code="200">Review successful created</response>
    /// <response code="500">User not found</response>
    [HttpPost("create")]
    [JwtAuthorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return StatusCode(500, "User not found");

        var review = new EReview
        {
            AuthorId = userId,
            TargetUserId = request.TargetUserId,
            OrderId = request.OrderId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var response = new ReviewResponse();
        response.ConvertFromModel(review);
        
        return Ok(response);
    }
    
    /// <summary>
    /// Getting review
    /// </summary>
    /// <response code="200">Review successful created</response>
    /// <response code="500">User not found</response>
    [HttpGet("get-by-user")]
    [JwtAuthorize]
    public async Task<IActionResult> GetUserReviews()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return StatusCode(500, "User not found");
        
        var reviews = await _context.Reviews
            .Where(r => r.TargetUserId == userId)
            .Select(r => new
                {
                    r.AuthorId,
                    r.Rating,
                    r.Comment,
                    r.OrderId,
                    r.CreatedAt
                })
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }
    
    /// <summary>
    /// Getting reviews by order id
    /// </summary>
    /// <param name="orderId">Order ID</param>
    /// <response code="200">Review successful created</response>
    /// <response code="500">User not found</response>
    [HttpGet("get-by-order/{orderId}")]
    [JwtAuthorize]
    public async Task<IActionResult> GetReviewsByOrder([FromRoute] int orderId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return StatusCode(500, "User not found");
        
        var reviews = await _context.Reviews
            .Where(r => r.OrderId == orderId)
            .Select(r => new
            {
                r.AuthorId,
                r.TargetUserId,
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }
}
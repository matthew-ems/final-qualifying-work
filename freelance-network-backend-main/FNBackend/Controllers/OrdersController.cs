using System.Security.Claims;
using FNBackend.Context;
using FNBackend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FNBackend.Dto.Order;
using FNBackend.Entities.Enums;
using FNBackend.Helpers;
using FNBackend.Middlewares.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.JsonPatch;

namespace FNBackend.Controllers;

[ApiController]
[Route($"{Http.RouteBase}/orders")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDb _context;
    private readonly ILogger<OrdersController> _logger;
    private readonly UserManager<EUser> _userManager;

    public OrdersController(ApplicationDb context, ILogger<OrdersController> logger, UserManager<EUser> userManager)
    {
        _context = context;
        _logger = logger;
        _userManager = userManager;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <response code="200">Список заказов заказчика</response>
    /// <response code="404">Пользователь не найден</response>
    [HttpGet("orders-execution")]
    [JwtAuthorize(Role = Roles.Performer)]
    public async Task<IActionResult> OrdersExecution()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var orders = await _context.Orders
            .Where(o => o.PerformerId == userId)
            .Select(o => new 
            {
                o.Id,
                o.Title,
                o.Description,
                o.TotalAmount,
                o.Currency,
                o.Status,
                o.PaymentMethod,
                o.UserId,
                o.CreatedAt,
                o.Tags,
                Direction = o.Direction.Title,
                ResponseCount = o.Responses.Count
            })
            .ToListAsync();
        
        if (orders.Count <= 0)
        {
            _logger.LogWarning($"No orders found for this user[{userId}]");

            return NotFound("No orders found for this user.");
        }

        _logger.LogInformation($"Returning my orders by userId: {userId}");

        return Ok(orders);
    }

    /// <summary>
    /// Получить все заказы, созданные текущим пользователем (заказчиком)
    /// </summary>
    /// <response code="200">Список заказов заказчика</response>
    /// <response code="404">Пользователь не найден</response>
    [HttpGet("get-my-orders/{userId}")]
    [JwtAuthorize(Role = Roles.Customer)]
    public async Task<IActionResult> GetMyOrders([FromRoute] string userId)
    {
        _logger.LogInformation($"Getting my orders by userId: {userId}");

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            _logger.LogError($"User[{userId}] not found");

            return NotFound($"User not found: {userId}");
        }

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Select(o => new 
            {
                o.Id,
                o.Title,
                o.Description,
                o.TotalAmount,
                o.Currency,
                o.Status,
                o.PaymentMethod,
                o.UserId,
                o.PerformerId,
                o.CreatedAt,
                o.Tags,
                Direction = o.Direction.Title,
                ResponseCount = o.Responses.Count
            })
            .ToListAsync();
        
        if (orders.Count <= 0)
        {
            _logger.LogWarning($"No orders found for this user[{userId}]");

            return NotFound("No orders found for this user.");
        }

        _logger.LogInformation($"Returning my orders by userId: {userId}");

        return Ok(orders);
    }

    /// <summary>
    /// Retrieves a paginated list of open orders using cursor-based pagination.
    /// </summary>
    /// <param name="userId">The ID of the user making the request.</param>
    /// <param name="pageSize">The number of orders to return on one page.</param>
    /// <param name="lastOrderId">The ID of the last order from the previous page.</param>
    /// <returns>A paginated list of orders with additional data such as views, responses, direction, etc.</returns>
    /// <response code="200">Returns the list of orders and the next cursor.</response>
    /// <response code="500">If an error occurs while retrieving the orders.</response>
    /// <response code="500">If orders or User not founded</response>
    [HttpGet("get-all/{userId}")]
    [JwtAuthorize(Role = Roles.Performer)]
    public async Task<IActionResult> GetAll([FromRoute] string userId, [FromQuery] int pageSize = 10,
        [FromQuery] int? cursor = null, [FromQuery] string[]? searchTags = null)
    {
        _logger.LogInformation($"{userId} getting orders with pageSize {pageSize} and lastOrderId {cursor}");

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            _logger.LogError($"User[{userId}] not found");

            return NotFound($"User not found: {userId}");
        }

        try
        {
            var ordersQuery = _context.Orders
                .AsNoTracking()
                .Where(o => o.Status == OrderStatus.Open);

            if (cursor.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.Id > cursor.Value);
            }
            
            if (searchTags != null && searchTags.Any())
            {
                ordersQuery = ordersQuery
                    .Where(o => searchTags.Any(tag => EF.Functions.Like(o.Tags, $"%{tag}%")));
            }
            
            var orderDtos = await ordersQuery
                .OrderBy(o => o.Id)
                .Take(pageSize)
                .Include(o => o.FavoriteOrders)
                .Include(o => o.Direction)
                .Include(o => o.Views)
                .Include(o => o.Responses)
                .Select(order => new OrderDto
                (
                    order.Title,
                    order.Description,
                    order.Boost,
                    order.Direction.Title
                )
                {
                    Id = order.Id,
                    Views = order.Views.Count,
                    Responses = order.Responses.Count,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    Currency = order.Currency,
                    PaymentMethod = order.PaymentMethod,
                    IsFavorite = order.FavoriteOrders.Any(f => f.UserId == userId && f.OrderId == order.Id),
                    CreatedAt = order.CreatedAt,
                    Tags = order.Tags
                })
                .ToListAsync();

            int? nextCursor = orderDtos.Count == pageSize ? orderDtos.Last().Id : null;

            _logger.LogInformation($"User[{userId}] orders:{orderDtos.Count}, Cursor: {cursor}");

            if (orderDtos.Count <= 0)
            {
                _logger.LogWarning($"User[{userId}] orders count is 0");

                return NotFound("Orders not found");
            }

            return Ok(new
            {
                Orders = orderDtos,
                NextCursor = nextCursor,
                Total = orderDtos.Count,
                CurrentCursor = cursor
            });
        }
        catch (Exception ex)
        {
            _logger.LogCritical($"From User[{userId}] [{ex.Message}]");

            return StatusCode(500, $"Error retrieving orders: {ex.Message}");
        }
    }

    /// <summary>
    /// Retrieves a specific order by its ID.
    /// </summary>
    /// <param name="orderId">The ID of the order to retrieve.</param>
    /// <returns>The requested order.</returns>
    /// <response code="200">Returns the requested order.</response>
    /// <response code="404">If the order is not found.</response>
    /// <response code="500">If an error occurs while retrieving the order.</response>
    [HttpGet("get/{orderId}")]
    [JwtAuthorize]
    public async Task<IActionResult> GetOrder([FromRoute] int orderId)
    {
        _logger.LogInformation($"Getting order with id: {orderId}");

        try
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
            {
                _logger.LogError($"Order with id: {orderId} not found");

                return NotFound("Order not found.");
            }

            _logger.LogInformation($"Getting order with id: {orderId} was successful");

            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogCritical($"Getting order with id: {orderId} failed: {ex.Message}");

            return StatusCode(500, $"Error retrieving order: {ex.Message}");
        }
    }

    /// <summary>
    /// Creates a new order.
    /// </summary>
    /// <param name="userId">Order owner</param>
    /// <param name="orderDto">The data transfer object containing the details of the order to create.</param>
    /// <returns>A confirmation message.</returns>
    /// <response code="200">If the order is created successfully.</response>
    /// <response code="400">If the title or description is null or empty.</response>
    /// <response code="500">If an error occurs while creating the order.</response>
    [HttpPost("create/{userId}")]
    [JwtAuthorize(Role = Roles.Customer)]
    public async Task<IActionResult> Create([FromRoute] string userId, [FromBody] CreateOrderDto orderDto)
    {
        _logger.LogInformation($"Creating order with user: {userId}");
        
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            _logger.LogError($"User[{userId}] not found");

            return Unauthorized("User not found.");
        }

        try
        {
            _logger.LogInformation($"Try creating order[{userId}]");
            
            if (String.IsNullOrEmpty(orderDto.Title) || String.IsNullOrEmpty(orderDto.Description))
            {
                _logger.LogError($"Title and Description are required: User[{userId}]");

                return BadRequest("Title or Description cant be null");
            }

            var order = new EOrder
            {
                Title = orderDto.Title,
                Description = orderDto.Description,
                TotalAmount = orderDto.TotalAmount,
                Currency = orderDto.Currency,
                Status = OrderStatus.Open,
                PaymentMethod = orderDto.PaymentMethod,
                DirectionId = orderDto.DirectionId,
                Boost = orderDto.Boost,
                UserId = userId,
                Tags = orderDto.Tags
            };

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created order with id: {order.Id} successfully");

            return Ok("Order created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogCritical($"Create order failed: {ex.Message}");

            return StatusCode(500, $"Error creating order: {ex.Message}");
        }
    }

    /// <summary>
    /// Updates an existing order.
    /// </summary>
    /// <param name="updateOrderDto">The data transfer object containing the updated details of the order.</param>
    /// <returns>A confirmation message.</returns>
    /// <response code="200">If the order is updated successfully.</response>
    /// <response code="400">If the order is not invalid.</response>
    /// <response code="404">If the order is not found.</response>
    /// <response code="500">If an error occurs while updating the order.</response>
    [HttpPut("update")]
    [JwtAuthorize]
    public async Task<IActionResult> Update([FromBody] UpdateOrderDto updateOrderDto)
    {
        _logger.LogInformation($"Patching order with id: {updateOrderDto.Id}");

        try
        {
            var order = await _context.Orders
                .Where(o => o.Id == updateOrderDto.Id)
                .FirstOrDefaultAsync();

            if (order == null)
            {
                _logger.LogError($"Order with id: {updateOrderDto.Id} not found");
                
                return NotFound($"Order[{updateOrderDto.Id}] not found.");
            }
            
            var validateResult = updateOrderDto.Validate();
            
            if (!validateResult.IsValid)
            {
                _logger.LogError($"Validate order with id: {updateOrderDto.Id} failed");
                
                return BadRequest(new
                {
                    Message = "Invalid order data",
                    Errors = validateResult.Errors
                });
            }
            
            order.Title = updateOrderDto.Title;
            order.Description = updateOrderDto.Description;
            order.TotalAmount = updateOrderDto.TotalAmount;
            order.Currency = updateOrderDto.Currency;
            order.Status = updateOrderDto.Status;
            order.PaymentMethod = updateOrderDto.PaymentMethod;
            order.Boost = updateOrderDto.Boost;
            order.DirectionId = updateOrderDto.DirectionId;
            order.Tags = updateOrderDto.Tags;
            order.PerformerId = updateOrderDto.PerformerId;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Patched order with id: {updateOrderDto.Id} successfully");

            return Ok("Order patched successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogCritical($"Patch order failed: {ex.Message}");
            return StatusCode(500, $"Error patching order: {ex.Message}");
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public AuthController(HospitalDbContext context)
        {
            _context = context;
        }

        // ================= Register =================
        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            if (_context.Users.Any(
                x => x.Username == user.Username))
            {
                return BadRequest(new
                {
                    message = "Username already exists"
                });
            }

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new
            {
                message = "User Registered Successfully"
            });
        }

        // ================= Login =================
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(
                x =>
                    x.Username == request.Username &&
                    x.Password == request.Password
            );

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid Username or Password"
                });
            }

            // Generate JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("SuperSecretKey12345678901234567890");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, user.Username) }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                message = "Login Successful",
                token = tokenString,
                username = user.Username,
                role = user.Role,
                fullName = user.FullName,
                email = user.Email
            });
        }
    }

    // ================= Login Request Model =================
    public class LoginRequest
    {
        public string Username { get; set; } = "";

        public string Password { get; set; } = "";
    }
}   
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using HospitalAPI.Data;
using System;
using System.Linq;

namespace HospitalAPI.Filters
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
    public class AuthorizeRolesAttribute : TypeFilterAttribute
    {
        public AuthorizeRolesAttribute(params string[] roles) : base(typeof(AuthorizeRolesFilter))
        {
            Arguments = new object[] { roles };
        }
    }

    public class AuthorizeRolesFilter : IAuthorizationFilter
    {
        private readonly string[] _roles;
        private readonly HospitalDbContext _context;

        public AuthorizeRolesFilter(string[] roles, HospitalDbContext context)
        {
            _roles = roles;
            _context = context;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var username = user.Identity.Name;
            if (string.IsNullOrEmpty(username))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var dbUser = _context.Users.FirstOrDefault(u => u.Username == username);
            if (dbUser == null || !_roles.Any(r => string.Equals(r, dbUser.Role, StringComparison.OrdinalIgnoreCase)))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}

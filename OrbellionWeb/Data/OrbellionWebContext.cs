using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OrbellionWeb.Data;
using OrbellionWeb.Models;

namespace OrbellionWeb.Data
{
    public class OrbellionWebContext(DbContextOptions<OrbellionWebContext> options) : IdentityDbContext<OrbellionWebUser>(options)
    {

    }
}

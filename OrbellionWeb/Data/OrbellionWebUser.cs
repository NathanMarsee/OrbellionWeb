using Microsoft.AspNetCore.Identity;
using OrbellionWeb.Models;

namespace OrbellionWeb.Data
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class OrbellionWebUser : IdentityUser
    {
        public string Name { get; set; } = string.Empty;
        public ICollection<Card> Cards { get; set; } = new List<Card>();
        public ICollection<Staple> Staples { get; set; } = new List<Staple>();
        public ICollection<Hellion> Hellions { get; set; } = new List<Hellion>();
    }
}

using Microsoft.AspNetCore.Identity;
using OrbellionWeb.Models;

namespace OrbellionWeb.Data
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class OrbellionWebUser : IdentityUser
    {
        public string Name { get; set; } = string.Empty;
        public IEnumerable<Card> Cards { get; set; } = Enumerable.Empty<Card>();
        public IEnumerable<Staple> Stapes { get; set; } = Enumerable.Empty<Staple>();
        public IEnumerable<Hellion> Hellions { get; set; } = Enumerable.Empty<Hellion>();
    }
}

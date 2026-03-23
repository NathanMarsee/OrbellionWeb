using OrbellionWeb.Shared;

namespace OrbellionWeb.Models
{
    public class Hellion
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Element Element { get; set; }
        public string? Text { get; set; }
        public bool IsDefeated { get; set; }
    }
}

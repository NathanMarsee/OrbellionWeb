using OrbellionWeb.Shared;

namespace OrbellionWeb.Models
{
    public class Staple
    {
        public string Name { get; set; } = string.Empty;
        public Element Element { get; set; }
        public string? Text { get; set; }
    }
}

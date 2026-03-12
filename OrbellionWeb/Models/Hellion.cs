using OrbellionWeb.Shared;

namespace OrbellionWeb.Models
{
    public class Hellion
    {
        public Guid Id { get; set; } = new Guid(); 
        public string Name { get; set; } = string.Empty;
        public Element Element { get; set; }
        public string? Text { get; set; }
        public bool IsDefeated { get; set; }

        public Hellion()
        {
            Id = Guid.NewGuid();
            Name = "";
            Text = "";
        }

        public Hellion(string name, Element element, string? text = null, bool isDefeated = false)
        {
            Id = Guid.NewGuid();
            Name = name;
            Element = element;
            Text = text;
            IsDefeated = isDefeated;
        }
    }
}

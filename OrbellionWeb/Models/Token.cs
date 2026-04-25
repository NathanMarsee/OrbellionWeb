using OrbellionWeb.Shared;

namespace OrbellionWeb.Models
{
    public class Token
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public Element Element { get; set; } = Element.Basic;
        public CardType Type { get; set; } = CardType.Action;
        public Power Power { get; set; } = Power.Weak;
        public string? Text { get; set; } = "";
    }
}

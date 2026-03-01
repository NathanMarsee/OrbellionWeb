using OrbellionWeb.Shared;
using System.ComponentModel.DataAnnotations;

namespace OrbellionWeb.Models
{
    public class Card
    {
        public string Name { get; set; } = string.Empty;
        public Element Element { get; set; }
        public CardType Type { get; set; }
        public Power? Power { get; set; }
        public string? Text { get; set; }
        public bool IsAce { get; set; }

        public Card()
        {
            Name = "";
            Text = "";
        }

        public Card(string name, Element element, CardType type, Power? power, string? text = null, bool isAce = false)
        {
            Name = name;
            Element = element;
            Type = type;
            Power = power;
            Text = text;
            IsAce = isAce;
        }
    }
}

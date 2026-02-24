using OrbellionWeb.Shared;
using System.ComponentModel.DataAnnotations;

namespace OrbellionWeb.Models
{
    public abstract class Card
    {
        public string Name { get; set; } = string.Empty;
        public Element Element { get; set; }
        public CardType Type { get; set; }
        public string? Text { get; set; }
        public bool IsAce { get; set; }

        public Card()
        {
            Name = "Default Name";
            Text = "Default Text";
        }

        public Card(string name, Element element, CardType type, string? text = null, bool isAce = false)
        {
            Name = name;
            Element = element;
            Type = type;
            Text = text;
            IsAce = isAce;
        }
    }
}

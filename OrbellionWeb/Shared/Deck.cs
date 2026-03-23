using OrbellionWeb.Models;
using System.Drawing.Configuration;

namespace OrbellionWeb.Shared
{
    public class Deck
    {
        public IEnumerable<Card> Cards { get; set; }

        public Deck() 
        { 
            Cards = new List<Card>();
        }
        public Deck(IEnumerable<Card> cards)
        {
            Cards = cards;
        }

        public Card? Draw()
        {
            Card? result = null;

            if (Cards.Any())
            {
                var card = Cards.First();
                Cards = Cards.Skip(1);
                result = card;
            }

            return result;
        }

        public void Shuffle()
        {
            var rnd = new Random();
            Cards = Cards.OrderBy(x => rnd.Next());
        }

        public void PutOnTop(Card card)
        {
            Cards = new[] { card }.Concat(Cards);
        }

        public void PutOnBottom(Card card)
        {
            Cards = Cards.Concat([card]);
        }

        public Card? Tutor(Guid id)
        {
            Card? card = Cards.FirstOrDefault(c => c.Id == id);
            Cards = Cards.Where(c => c.Id != id);
            return card;
        }
    }
}

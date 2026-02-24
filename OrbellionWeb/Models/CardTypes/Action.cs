using OrbellionWeb.Shared;

namespace OrbellionWeb.Models.CardTypes
{
    public class Action : Card
    {
        public Action() : base()
        {
            
        }

        public Action(string name, Element element, string? text = null, bool isAce = false)
            : base(name, element, CardType.Action, text, isAce)
        {
        }
    }
}

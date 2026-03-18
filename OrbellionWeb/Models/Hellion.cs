using OrbellionWeb.Shared;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Linq;

namespace OrbellionWeb.Models
{
    public class Hellion
    {
        public Guid Id { get; set; }
        private string _name = string.Empty;
        public string Name
        {
            get
            {
                return _name;
            }
            set
            {
                this.IsDirty = value != _name;
                _name = value;
            }
        }
        private Element _element;
        public Element Element
        {
            get
            {
                return _element;
            }
            set
            {
                this.IsDirty = value != _element;
                _element = value;
            }
        }
        private string _text = string.Empty;
        public string Text
        {
            get
            {
                return _text;
            }
            set
            {
                this.IsDirty = value != _text;
                _text = value;
            }
        }
        [NotMapped]
        public bool IsDefeated { get; set; }
        [NotMapped]
        public bool IsDirty { get; set; }
    }
}

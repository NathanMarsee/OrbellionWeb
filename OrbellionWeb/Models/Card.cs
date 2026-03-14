using Microsoft.EntityFrameworkCore.Internal;
using OrbellionWeb.Data;
using OrbellionWeb.Shared;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrbellionWeb.Models
{
    public class Card()
    {
        public Guid Id { get; set; }
        private String _name = string.Empty;
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
        public Element Element {
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
        private CardType _type;
        public CardType Type { 
            get 
            { 
                return _type; 
            }
            set
            {
                this.IsDirty = value != _type;
                _type = value;
            }
        }
        private Power? _power;
        public Power? Power 
        {
            get
            {
                return _power;
            }
            set 
            {
                this.IsDirty = value != _power;
                _power = value;
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
        private bool _isAce;
        public bool IsAce
        {
            get 
            { 
                return _isAce; 
            }
            set
            {
                this.IsDirty = value != _isAce;
                _isAce = value;
            }
        }
        [NotMapped]
        public bool IsDirty { get; set; }
    }
}

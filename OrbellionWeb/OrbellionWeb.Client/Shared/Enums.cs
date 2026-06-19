namespace OrbellionWeb.Shared
{
    [Flags]
    public enum Element
    {
        Basic = 0,
        Fire = 1 << 0,
        Water = 1 << 1,
        Earth = 1 << 2,
        Wind = 1 << 3,
        Light = 1 << 4,
        Dark = 1 << 5
    }

    public enum CardType
    {
        Action = 0,
        Move = 1,
        Item = 2
    }

    public enum Power
    {
        Weak = 0,
        Normal = 1,
        Strong = 2
    }
}

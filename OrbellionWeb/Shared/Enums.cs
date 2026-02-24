namespace OrbellionWeb.Shared
{
    [Flags]
    public enum Element
    {
        None = 0,
        Fire = 1 << 0,
        Water = 1 << 1,
        Earth = 1 << 2,
        Wind = 1 << 3,
        Light = 1 << 4,
        Dark = 1 << 5
    }

    public enum CardType
    {
        None = 0,
        Move = 1,
        Item = 2,
        Action = 3
    }

    public enum Power
    {
        None = 0,
        Weak = 1,
        Normal = 2,
        Strong = 3
    }
}

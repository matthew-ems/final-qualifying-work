namespace FNBackend.Helpers;

public static class Directions
{
    public const string Development = "Development";
    public const string Testing = "Testing";
    public const string Administration = "Administration";
    public const string Design = "Design";
    public const string Content = "Content";
    public const string Marketing = "Marketing";
    public const string Other = "Other";

    public static string[] AllDirections =
    {
        Development,
        Testing,
        Administration,
        Design,
        Content,
        Marketing,
        Other
    };
}

public static class Experience
{
    public const string Intern = "No experience";
    public const string Junior = "up to 2 years";
    public const string Middle = "from 2 to 5 years";
    public const string Senior = "from 5 to 8 years";
    public const string Professional = "more than 8 years";

    public static string[] AllExperience =
    {
        Intern,
        Junior,
        Middle,
        Senior,
        Professional
    };
}
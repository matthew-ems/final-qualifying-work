namespace FNBackend;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
    public const string Performer = "Performer";
    public const string Main = "role";

    /// <summary>
    /// Checking if a role is admin
    /// </summary>
    /// <param name="role">Checking role</param>
    /// <returns>true if role is admin</returns>
    public static bool CheckAdminRole(string role) =>
        role == Admin;

    /// <summary>
    /// Checking role validity
    /// </summary>
    /// <param name="role">Checking role</param>
    /// <returns>Will return true if the role is valid</returns>
    public static bool ValidationRole(string role) => 
        role == Admin || role == Customer || role == Performer;
}
import User from "../models/User.js";
import Role from "../models/Role.js";

/**
 * Assign default roles to users who don't have any role assigned
 * This is useful for migrating existing users to the RBAC system
 */
export const assignDefaultRolesToUsers = async () => {
  try {
    // Find users without roles
    const usersWithoutRoles = await User.find({ role: null });

    if (usersWithoutRoles.length === 0) {
      return { success: true, message: "All users already have roles" };
    }

    // Get the default Viewer role
    const viewerRole = await Role.findOne({ name: "viewer" });
    if (!viewerRole) {
      return {
        success: false,
        error: "Default viewer role not found. Please seed RBAC first.",
      };
    }

    // Assign Viewer role to all users without roles
    const updateResult = await User.updateMany(
      { role: null },
      { role: viewerRole._id }
    );

    console.log(
      `✅ Assigned viewer role to ${updateResult.modifiedCount} users`
    );

    return {
      success: true,
      message: `Assigned viewer role to ${updateResult.modifiedCount} users`,
      modifiedCount: updateResult.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Error assigning default roles:", error);
    return { success: false, error };
  }
};

/**
 * Assign specific role to a user by email
 */
export const assignRoleToUserByEmail = async (
  email: string,
  roleName: string
) => {
  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Find the role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return { success: false, error: `Role '${roleName}' not found` };
    }

    // Assign the role
    user.role = role._id;
    await user.save();

    return {
      success: true,
      message: `Assigned ${roleName} role to user: ${email}`,
      user: { email: user.email, role: roleName },
    };
  } catch (error) {
    console.error("❌ Error assigning role to user:", error);
    return { success: false, error };
  }
};

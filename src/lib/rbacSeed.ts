import Role from "../models/Role.js";

// Create roles with permission strings
export const seedRoles = async () => {
  try {
    console.log("🌱 Creating roles...");

    const roles = [
      {
        name: "admin",
        description: "Full access to all resources",
        permissions: [
          "users.create",
          "users.view",
          "users.update",
          "users.delete",
          "roles.create",
          "roles.view",
          "roles.update",
          "roles.delete",
          "posts.create",
          "posts.view",
          "posts.update",
          "posts.delete",
        ],
      },
      {
        name: "editor",
        description: "Can read and edit content, limited user management",
        permissions: [
          "users.view",
          "users.update",
          "roles.view",
          "posts.create",
          "posts.view",
          "posts.update",
          "posts.delete",
        ],
      },
      {
        name: "viewer",
        description: "Read-only access to all resources",
        permissions: ["users.view", "roles.view", "posts.view"],
      },
    ];

    for (const roleData of roles) {
      let role = await Role.findOne({ name: roleData.name });

      if (!role) {
        role = await Role.create({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });

        console.log(
          `✅ Created role: ${role.name} with ${roleData.permissions.length} permissions`
        );
      } else {
        console.log(`⏭️  Role already exists: ${role.name}`);
      }
    }

    console.log("🎉 All roles created successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error creating roles:", error);
    return { success: false, error };
  }
};

// Seed RBAC data
export const seedRBAC = async () => {
  try {
    console.log("🚀 Starting RBAC setup...");

    // Create roles (permissions are now stored as strings in roles)
    const roleResult = await seedRoles();
    if (!roleResult.success) {
      throw roleResult.error;
    }

    console.log("🎊 RBAC setup completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("💥 Error setting up RBAC:", error);
    return { success: false, error };
  }
};

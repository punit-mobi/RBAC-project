import { connectToDB } from "./ConnectDB.js";
import { seedRBAC } from "./rbacSeed.js";
import { assignDefaultRolesToUsers } from "./assignDefaultRoles.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

/**
 * Complete RBAC setup and user role assignment script
 * This script will:
 * 1. Connect to database
 * 2. Seed RBAC (permissions and roles)
 * 3. Assign default roles to users without roles
 * 4. Show current status
 */
const setupRBAC = async () => {
  try {
    console.log("🚀 Starting RBAC setup...");

    // Connect to database
    await connectToDB();
    console.log("✅ Connected to database");

    // Seed RBAC
    console.log("🌱 Seeding RBAC...");
    const seedResult = await seedRBAC();
    if (!seedResult.success) {
      console.error("❌ Failed to seed RBAC:", seedResult.error);
      return;
    }
    console.log("✅ RBAC seeded successfully");

    // Check current status
    const userCount = await User.countDocuments();
    const roleCount = await Role.countDocuments();
    const usersWithoutRoles = await User.countDocuments({ role: null });

    console.log("\n📊 Current Status:");
    console.log(`- Total users: ${userCount}`);
    console.log(`- Total roles: ${roleCount}`);
    console.log(`- Users without roles: ${usersWithoutRoles}`);

    // Assign default roles to users without roles
    if (usersWithoutRoles > 0) {
      console.log("\n🔧 Assigning default roles to users without roles...");
      const assignResult = await assignDefaultRolesToUsers();
      if (assignResult.success) {
        console.log(`✅ ${assignResult.message}`);
      } else {
        console.error("❌ Failed to assign roles:", assignResult.error);
      }
    } else {
      console.log("✅ All users already have roles assigned");
    }

    // Show final status
    const finalUsersWithoutRoles = await User.countDocuments({ role: null });
    console.log(`\n📊 Final Status:`);
    console.log(`- Users without roles: ${finalUsersWithoutRoles}`);

    // Show all roles and their permissions
    console.log("\n📋 Available Roles and Permissions:");
    const roles = await Role.find();
    roles.forEach((role) => {
      console.log(`\n${role.name}:`);
      console.log(`  Description: ${role.description}`);
      console.log(`  Permissions: ${role.permissions.join(", ")}`);
    });

    console.log("\n🎉 RBAC setup completed successfully!");
  } catch (error) {
    console.error("💥 Error during RBAC setup:", error);
  } finally {
    process.exit(0);
  }
};

// Run the setup
setupRBAC();

import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "editor", "viewer", "super_admin"],
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-defined permissions for each role
const ROLE_PERMISSIONS = {
  admin: [
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
  editor: [
    "users.view",
    "users.update",
    "roles.view",
    "posts.create",
    "posts.view",
    "posts.update",
    "posts.delete",
  ],
  viewer: ["users.view", "roles.view", "posts.view"],
};

// Static method to initialize roles
roleSchema.statics.initializeRoles = async function () {
  const roles = await this.find();

  if (roles.length === 0) {
    const roleData = [
      {
        name: "admin",
        permissions: ROLE_PERMISSIONS.admin,
        description: "Full access to all resources",
      },
      {
        name: "editor",
        permissions: ROLE_PERMISSIONS.editor,
        description: "Can read and edit content, limited user management",
      },
      {
        name: "viewer",
        permissions: ROLE_PERMISSIONS.viewer,
        description: "Read-only access to all resources",
      },
    ];

    await this.insertMany(roleData);
    console.log("Roles initialized successfully");
  }
};

const Role = mongoose.model("Role", roleSchema);
export default Role;

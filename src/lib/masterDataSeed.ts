// Master data seeding data
export const masterDataSeed = [
  // Roles master data
  {
    data_type: "roles",
    data_key: "admin",
    data_value: {
      name: "Administrator",
      permissions: ["read", "write", "delete", "manage_users"],
      level: 1,
    },
    description: "Full administrative access",
  },
  {
    data_type: "roles",
    data_key: "user",
    data_value: {
      name: "Regular User",
      permissions: ["read", "write"],
      level: 2,
    },
    description: "Standard user access",
  },
  {
    data_type: "roles",
    data_key: "guest",
    data_value: {
      name: "Guest User",
      permissions: ["read"],
      level: 3,
    },
    description: "Limited read-only access",
  },

  // Permissions master data
  {
    data_type: "permissions",
    data_key: "read",
    data_value: {
      name: "Read Access",
      description: "View data and resources",
      module: "general",
    },
    description: "Permission to read/view data",
  },
  {
    data_type: "permissions",
    data_key: "write",
    data_value: {
      name: "Write Access",
      description: "Create and modify data",
      module: "general",
    },
    description: "Permission to create and modify data",
  },
  {
    data_type: "permissions",
    data_key: "delete",
    data_value: {
      name: "Delete Access",
      description: "Remove data and resources",
      module: "general",
    },
    description: "Permission to delete data",
  },
  {
    data_type: "permissions",
    data_key: "manage_users",
    data_value: {
      name: "User Management",
      description: "Manage user accounts and permissions",
      module: "user_management",
    },
    description: "Permission to manage users",
  },

  // Modules master data
  {
    data_type: "modules",
    data_key: "user_management",
    data_value: {
      name: "User Management",
      description: "Module for managing users and their permissions",
      sort_order: 1,
      is_visible: true,
    },
    description: "User management module",
  },
  {
    data_type: "modules",
    data_key: "profile_management",
    data_value: {
      name: "Profile Management",
      description: "Module for managing user profiles",
      sort_order: 2,
      is_visible: true,
    },
    description: "Profile management module",
  },
  {
    data_type: "modules",
    data_key: "system_settings",
    data_value: {
      name: "System Settings",
      description: "Module for system configuration",
      sort_order: 3,
      is_visible: true,
    },
    description: "System settings module",
  },

  // Configuration master data
  {
    data_type: "configurations",
    data_key: "app_settings",
    data_value: {
      app_name: "demo-project",
      version: "1.0.0",
      maintenance_mode: false,
      max_login_attempts: 5,
      session_timeout: 3600,
    },
    description: "Application configuration settings",
  },
  {
    data_type: "configurations",
    data_key: "email_settings",
    data_value: {
      smtp_host: "smtp.gmail.com",
      smtp_port: 587,
      from_email: "noreply@example.com",
      templates_enabled: true,
    },
    description: "Email service configuration",
  },
];

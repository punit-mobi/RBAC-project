import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerSchema } from "../modules/auth/schemas/register.schema.js";
import { loginSchema } from "../modules/auth/schemas/login.schema.js";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../modules/auth/schemas/password-reset.schema.js";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Create registry
const registry = new OpenAPIRegistry();

// Enhanced User schema with better validation
const UserSchema = z
  .object({
    _id: z.string().min(1).openapi({
      example: "64f1a2b3c4d5e6f7g8h9i0j1",
      description: "Unique user identifier",
    }),
    first_name: z.string().min(2).max(50).openapi({
      example: "John",
      description: "User's first name",
    }),
    last_name: z.string().max(50).optional().openapi({
      example: "Doe",
      description: "User's last name",
    }),
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User's email address",
    }),
    about: z.string().max(1000).optional().openapi({
      example:
        "I am a software developer passionate about creating amazing applications",
      description: "Brief description about the user",
    }),
    address: z.string().max(200).optional().openapi({
      example: "123 Main St, California, USA",
      description: "User's address",
    }),
    is_admin: z
      .union([z.boolean(), z.string()])
      .default(false)
      .transform((val) => {
        if (typeof val === "string") {
          return val === "true" || val === "1";
        }
        return val;
      })
      .openapi({
        example: false,
        description:
          "Whether the user has admin privileges (accepts boolean or string 'true'/'false')",
      }),
    role: z.string().min(1).openapi({
      example: "64f1a2b3c4d5e6f7g8h9i0j2",
      description: "User's assigned role ID",
    }),
    gender: z.enum(["male", "female", "other"]).openapi({
      example: "male",
      description: "User's gender",
    }),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({
        example: "1990-01-15",
        description: "User's date of birth in YYYY-MM-DD format",
      }),
    education_qualification: z.string().max(200).optional().openapi({
      example: "Bachelor's in Computer Science",
      description: "User's education qualification",
    }),
    is_active: z.boolean().default(true).openapi({
      example: true,
      description: "Whether the user account is active",
    }),
    created_at: z.string().datetime().openapi({
      example: "2023-09-01T10:00:00Z",
      description: "Account creation timestamp",
    }),
    updated_at: z.string().datetime().openapi({
      example: "2023-09-01T10:00:00Z",
      description: "Last update timestamp",
    }),
  })
  .openapi("User");

// Enhanced Role schema
const RoleSchema = z
  .object({
    _id: z.string().min(1).openapi({
      example: "64f1a2b3c4d5e6f7g8h9i0j2",
      description: "Unique role identifier",
    }),
    name: z.string().min(2).max(50).openapi({
      example: "Admin",
      description: "Role name",
    }),
    description: z.string().max(500).openapi({
      example: "Can manage users, posts, and roles",
      description: "Role description",
    }),
    permissions: z.array(z.string().min(1)).openapi({
      example: ["users.view", "users.create", "posts.view"],
      description: "List of permission strings assigned to this role",
    }),
    is_active: z.boolean().default(true).openapi({
      example: true,
      description: "Whether the role is active",
    }),
    created_at: z.string().datetime().openapi({
      example: "2023-09-01T10:00:00Z",
      description: "Role creation timestamp",
    }),
    updated_at: z.string().datetime().openapi({
      example: "2023-09-01T10:00:00Z",
      description: "Last update timestamp",
    }),
  })
  .openapi("Role");

// Enhanced Post schema
const PostSchema = z
  .object({
    _id: z.string().min(1).openapi({
      example: "64f1a2b3c4d5e6f7g8h9i0j4",
      description: "Unique post identifier",
    }),
    title: z.string().min(1).max(200).openapi({
      example: "My First Post",
      description: "Post title",
    }),
    content: z.string().min(1).max(10000).openapi({
      example: "This is the content of my first post.",
      description: "Post content",
    }),
    author: UserSchema.openapi({
      description: "Post author information",
    }),
    created_at: z.string().datetime().openapi({
      example: "2023-09-01T10:00:00Z",
      description: "Post creation timestamp",
    }),
    updated_at: z.string().datetime().openapi({
      example: "2023-09-01T10:00:00Z",
      description: "Last update timestamp",
    }),
  })
  .openapi("Post");

// Enhanced API Response schemas
const ApiResponseSchema = z
  .object({
    status: z.boolean().openapi({
      example: true,
      description: "Request status",
    }),
    status_code: z.number().int().min(100).max(599).openapi({
      example: 200,
      description: "HTTP status code",
    }),
    message: z.string().min(1).openapi({
      example: "Success message",
      description: "Response message",
    }),
    data: z.any().optional().openapi({
      description: "Response data",
    }),
  })
  .openapi("ApiResponse");

const ErrorResponseSchema = z
  .object({
    status: z.boolean().default(false).openapi({
      example: false,
      description: "Request status",
    }),
    status_code: z.number().int().min(400).max(599).openapi({
      example: 400,
      description: "HTTP status code",
    }),
    message: z.string().min(1).openapi({
      example: "Error message",
      description: "Error message",
    }),
    error: z.any().optional().openapi({
      description: "Error details",
    }),
  })
  .openapi("ErrorResponse");

// Enhanced auth schemas with better validation
const EnhancedRegisterSchema = z
  .object({
    first_name: z.string().min(2).max(50).openapi({
      example: "John",
      description: "User's first name",
    }),
    last_name: z.string().max(50).optional().openapi({
      example: "Doe",
      description: "User's last name",
    }),
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User's email address",
    }),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .openapi({
        example: "Password123",
        description:
          "Password must contain at least 8 characters with uppercase, lowercase, and number",
      }),
    about: z.string().max(1000).optional().openapi({
      example: "I am a software developer",
      description: "Brief description about the user",
    }),
    address: z.string().max(200).optional().openapi({
      example: "123 Main St, California, USA",
      description: "User's address",
    }),
    is_admin: z
      .union([z.boolean(), z.string()])
      .default(false)
      .transform((val) => {
        if (typeof val === "string") {
          return val === "true" || val === "1";
        }
        return val;
      })
      .openapi({
        example: false,
        description:
          "Whether the user has admin privileges (accepts boolean or string 'true'/'false')",
      }),
    gender: z.enum(["male", "female", "other"]).openapi({
      example: "male",
      description: "User's gender",
    }),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({
        example: "1990-01-15",
        description: "User's date of birth in YYYY-MM-DD format",
      }),
    education_qualification: z.string().max(200).optional().openapi({
      example: "Bachelor's in Computer Science",
      description: "User's education qualification",
    }),
  })
  .openapi("UserRegister");

const EnhancedLoginSchema = z
  .object({
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User's email address",
    }),
    password: z.string().min(1).openapi({
      example: "Password123",
      description: "User's password",
    }),
  })
  .openapi("UserLogin");

const EnhancedPasswordResetRequestSchema = z
  .object({
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User's email address",
    }),
  })
  .openapi("PasswordResetRequest");

const EnhancedPasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .openapi({
        example: "NewPassword123",
        description:
          "New password must contain at least 8 characters with uppercase, lowercase, and number",
      }),
  })
  .openapi("PasswordReset");

// Success response schemas
const RegisterSuccessResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    token: z.string().min(1).openapi({
      description: "JWT authentication token",
    }),
    user: UserSchema,
  }),
}).openapi("RegisterSuccessResponse");

const LoginSuccessResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    token: z.string().min(1).openapi({
      description: "JWT authentication token",
    }),
    user: UserSchema,
  }),
}).openapi("LoginSuccessResponse");

const PasswordResetSuccessResponseSchema = ApiResponseSchema.extend({
  data: z.object({}).optional().nullable(),
}).openapi("PasswordResetSuccessResponse");

// Register all schemas
registry.register("User", UserSchema);
registry.register("Role", RoleSchema);
registry.register("Post", PostSchema);
registry.register("ApiResponse", ApiResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("UserRegister", EnhancedRegisterSchema);
registry.register("UserLogin", EnhancedLoginSchema);
registry.register("PasswordResetRequest", EnhancedPasswordResetRequestSchema);
registry.register("PasswordReset", EnhancedPasswordResetSchema);
registry.register("RegisterSuccessResponse", RegisterSuccessResponseSchema);
registry.register("LoginSuccessResponse", LoginSuccessResponseSchema);
registry.register(
  "PasswordResetSuccessResponse",
  PasswordResetSuccessResponseSchema
);

// Generate OpenAPI document with paths
const generator = new OpenApiGeneratorV3(registry.definitions);
const baseDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "RBAC System API",
    version: "1.0.0",
    description:
      "Complete Role-Based Access Control (RBAC) system with user authentication, role management, permission control, and content management.",
    contact: {
      name: "API Support",
      email: "support@rbacsystem.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
    {
      url: "https://api.demoproject.com",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Auth",
      description:
        "Authentication endpoints - Register, login, password reset. Rate limited: 5 attempts per 15 minutes for login/register, 3 attempts per hour for password reset.",
    },
    {
      name: "Users",
      description:
        "User management endpoints - CRUD operations for users. Rate limited: 200 requests per 15 minutes for read operations, 10 requests per hour for sensitive operations.",
    },
    {
      name: "Roles",
      description:
        "Role management endpoints - CRUD operations for roles and permissions. Rate limited: 200 requests per 15 minutes for read operations, 10 requests per hour for sensitive operations.",
    },
    {
      name: "Posts",
      description:
        "Post management endpoints - CRUD operations for posts. Rate limited: 200 requests per 15 minutes for read/create operations, 10 requests per hour for delete operations.",
    },
    {
      name: "Master Data",
      description: "Master data management endpoints",
    },
    {
      name: "System",
      description: "System health and status endpoints",
    },
  ],
});

// Add paths manually
export const openApiDocument = {
  ...baseDocument,
  paths: {
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Create a new user account with profile information. Rate limited to 5 attempts per 15 minutes per IP address.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegister" },
            },
          },
        },
        responses: {
          "200": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterSuccessResponse",
                },
              },
            },
          },
          "409": {
            description: "User already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login a user",
        description:
          "Authenticate user with email and password. Rate limited to 5 attempts per 15 minutes per IP address.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLogin" },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginSuccessResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/request-password-reset": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset",
        description:
          "Send password reset link to user's email. Rate limited to 3 attempts per hour per IP address.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordResetRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset link sent successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PasswordResetSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/reset-password/{token}": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        description: "Reset user password using reset token",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Password reset token",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordReset" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PasswordResetSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/roles": {
      get: {
        tags: ["Roles"],
        summary: "Get all roles | role.view",
        description: "Retrieve a list of all roles",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Roles retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Roles retrieved successfully",
                    },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Role" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Roles"],
        summary: "Create a new role | role.create",
        description: "Create a new role with specified permissions",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "permissions"],
                properties: {
                  name: { type: "string", minLength: 1, maxLength: 50 },
                  description: { type: "string", maxLength: 200 },
                  permissions: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Role created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/roles/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Get role by ID | role.view",
        description: "Retrieve a specific role by its ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Role ID",
          },
        ],
        responses: {
          "200": {
            description: "Role retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Role retrieved successfully",
                    },
                    data: { $ref: "#/components/schemas/Role" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Role not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Roles"],
        summary: "Update role | role.update",
        description: "Update an existing role's details and permissions",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Role ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 1, maxLength: 50 },
                  description: { type: "string", maxLength: 200 },
                  permissions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Role updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Role updated successfully",
                    },
                    data: { $ref: "#/components/schemas/Role" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Role not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Roles"],
        summary: "Delete role | role.delete",
        description: "Delete a role from the system",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Role ID",
          },
        ],
        responses: {
          "200": {
            description: "Role deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          "404": {
            description: "Role not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users | users.view",
        description: "Retrieve a paginated list of all users",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Items per page",
          },
        ],
        responses: {
          "200": {
            description: "Users retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Users retrieved successfully",
                    },
                    data: {
                      type: "object",
                      properties: {
                        users: {
                          type: "array",
                          items: { $ref: "#/components/schemas/User" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            total: { type: "number" },
                            page: { type: "number" },
                            limit: { type: "number" },
                            pages: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID | users.view",
        description: "Retrieve a specific user by their ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "User retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "User retrieved successfully",
                    },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user | users.update",
        description: "Update an existing user's information",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  first_name: { type: "string", minLength: 2, maxLength: 50 },
                  last_name: { type: "string", maxLength: 50 },
                  about: { type: "string", maxLength: 1000 },
                  address: { type: "string", maxLength: 200 },
                  gender: { type: "string", enum: ["male", "female", "other"] },
                  date_of_birth: {
                    type: "string",
                    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  },
                  education_qualification: { type: "string", maxLength: 200 },
                },
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  first_name: { type: "string", minLength: 2, maxLength: 50 },
                  last_name: { type: "string", maxLength: 50 },
                  about: { type: "string", maxLength: 1000 },
                  address: { type: "string", maxLength: 200 },
                  gender: { type: "string", enum: ["male", "female", "other"] },
                  date_of_birth: {
                    type: "string",
                    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  },
                  education_qualification: { type: "string", maxLength: 200 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "User updated successfully",
                    },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user | users.delete",
        description: "Delete a user from the system",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/profile/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile | users.view",
        description:
          "Retrieve the profile information of the currently authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "User profile retrieved successfully",
                    },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}/assign-role": {
      patch: {
        tags: ["Users"],
        summary: "Assign role to user | users.update",
        description:
          "Assign a specific role to a user. Rate limited to 10 requests per hour.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role_id: {
                    type: "string",
                    description: "Role ID to assign to the user",
                    example: "64f1a2b3c4d5e6f7g8h9i0j2",
                  },
                },
                required: ["roleId"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Role assigned successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Role assigned to user successfully",
                    },
                    data: {
                      type: "object",
                      properties: {
                        first_name: { type: "string", example: "John" },
                        last_name: { type: "string", example: "Doe" },
                        email: {
                          type: "string",
                          example: "john.doe@example.com",
                        },
                        role: { type: "string", example: "admin" },
                        is_admin: { type: "boolean", example: true },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request - Missing roleId or user ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User or role not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}/remove-role": {
      patch: {
        tags: ["Users"],
        summary: "Remove role from user | users.update",
        description:
          "Remove the assigned role from a user. Rate limited to 10 requests per hour.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "Role removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Role removed from user successfully",
                    },
                    data: {
                      type: "object",
                      properties: {
                        first_name: { type: "string", example: "John" },
                        last_name: { type: "string", example: "Doe" },
                        email: {
                          type: "string",
                          example: "john.doe@example.com",
                        },
                        role: { type: "string", example: null },
                        is_admin: { type: "boolean", example: false },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request - Missing user ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/posts": {
      get: {
        tags: ["Posts"],
        summary: "Get all posts | posts.view",
        description: "Retrieve a paginated list of all posts",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Items per page",
          },
        ],
        responses: {
          "200": {
            description: "Posts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Posts retrieved successfully",
                    },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a new post | posts.create",
        description: "Create a new post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 200 },
                  content: { type: "string", minLength: 1, maxLength: 10000 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 201 },
                    message: {
                      type: "string",
                      example: "Post created successfully",
                    },
                    data: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Get post by ID | posts.view",
        description: "Retrieve a specific post by its ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Post ID",
          },
        ],
        responses: {
          "200": {
            description: "Post retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean", example: true },
                    status_code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "Post retrieved successfully",
                    },
                    data: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete post | posts.delete",
        description: "Delete a post from the system",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Post ID",
          },
        ],
        responses: {
          "200": {
            description: "Post deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    ...baseDocument.components,
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token",
      },
    },
  },
};

// Export schemas for use in routers
export {
  UserSchema,
  RoleSchema,
  PostSchema,
  ApiResponseSchema,
  ErrorResponseSchema,
  EnhancedRegisterSchema,
  EnhancedLoginSchema,
  EnhancedPasswordResetRequestSchema,
  EnhancedPasswordResetSchema,
};

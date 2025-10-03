import { updateRoleSchema } from "./schemas/update.role.schema.js";
import { createRoleSchema } from "./schemas/create.role.schema.js";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../../common/response.js";
import { ErrorMessages, SuccessMessages } from "../../common/messages.js";
import Role from "../../models/Role.js";
import { z } from "zod";
import { getRefId } from "@asteasolutions/zod-to-openapi";

// Create a new role
// POST - /api/v1/roles
const createRole = async (req: Request, res: Response) => {
  try {
    const parsedData = createRoleSchema.safeParse(req.body);

    if (!parsedData.success) {
      return await handleResponse({
        res,
        message: ErrorMessages.VALIDATION_FAILED,
        status: StatusCodes.BAD_REQUEST,
        error: parsedData.error,
        req,
      });
    }

    const { name, description, permissions } = parsedData.data;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return await handleResponse({
        res,
        message: "Role with this name already exists",
        status: StatusCodes.CONFLICT,
        error: null,
        req,
      });
    }

    // Validate permission format (resource.action)
    const validPermissionPattern =
      /^(users|posts|roles)\.(view|create|update|delete)$/;
    const invalidPermissions = permissions.filter(
      (perm) => !validPermissionPattern.test(perm)
    );

    if (invalidPermissions.length > 0) {
      return await handleResponse({
        res,
        message: `Invalid permission format: ${invalidPermissions.join(
          ", "
        )}. Must be in format: resource.action`,
        status: StatusCodes.BAD_REQUEST,
        error: null,
        req,
      });
    }
    // create a role in the database
    const newRole = await Role.create({
      name,
      description: description || "",
      permissions,
    });

    await handleResponse({
      res,
      data: newRole,
      message: "Role created successfully",
      status: StatusCodes.CREATED,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

// Get all roles
// GET - /api/v1/roles
const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ is_active: true }).select("-__v");

    await handleResponse({
      res,
      data: roles,
      message: "Roles retrieved successfully",
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

// Get role by ID
// GET - /api/v1/roles/:id
const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id).select("-__v");

    if (!role) {
      return await handleResponse({
        res,
        message: "Role not found",
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    await handleResponse({
      res,
      data: role,
      message: "Role retrieved successfully",
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

// Update role
// PUT - /api/v1/roles/:id
const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsedData = updateRoleSchema.safeParse(req.body);

    if (!parsedData.success) {
      return await handleResponse({
        res,
        message: ErrorMessages.VALIDATION_FAILED,
        status: StatusCodes.BAD_REQUEST,
        error: parsedData.error,
        req,
      });
    }

    const updateData = parsedData.data;

    // If updating permissions, validate format
    if (updateData.permissions) {
      const validPermissionPattern =
        /^(users|posts|roles)\.(view|create|update|delete)$/;
      const invalidPermissions = updateData.permissions.filter(
        (perm) => !validPermissionPattern.test(perm)
      );

      if (invalidPermissions.length > 0) {
        return await handleResponse({
          res,
          message: `Invalid permission format: ${invalidPermissions.join(
            ", "
          )}. Must be in format: resource.action`,
          status: StatusCodes.BAD_REQUEST,
          error: null,
          req,
        });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!updatedRole) {
      return await handleResponse({
        res,
        message: "Role not found",
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    await handleResponse({
      res,
      data: updatedRole,
      message: "Role updated successfully",
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

// Delete role (soft delete)
// DELETE - /api/v1/roles/:id
const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedRole = await Role.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    ).select("-__v");

    if (!deletedRole) {
      return await handleResponse({
        res,
        message: "Role not found",
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    await handleResponse({
      res,
      data: deletedRole,
      message: "Role deleted successfully",
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

// Get all available permissions
// GET - /api/v1/roles/permissions
const getAllPermissions = async (req: Request, res: Response) => {
  try {
    // Define available permissions as a constant list
    const permissions = [
      // Posts permissions
      {
        name: "posts.view",
        resource: "posts",
        action: "view",
        description: "View posts",
      },
      {
        name: "posts.create",
        resource: "posts",
        action: "create",
        description: "Create posts",
      },
      {
        name: "posts.update",
        resource: "posts",
        action: "update",
        description: "Update posts",
      },
      {
        name: "posts.delete",
        resource: "posts",
        action: "delete",
        description: "Delete posts",
      },
      // Users permissions
      {
        name: "users.view",
        resource: "users",
        action: "view",
        description: "View users",
      },
      {
        name: "users.create",
        resource: "users",
        action: "create",
        description: "Create users",
      },
      {
        name: "users.update",
        resource: "users",
        action: "update",
        description: "Update users",
      },
      {
        name: "users.delete",
        resource: "users",
        action: "delete",
        description: "Delete users",
      },
      // Roles permissions
      {
        name: "roles.view",
        resource: "roles",
        action: "view",
        description: "View roles",
      },
      {
        name: "roles.create",
        resource: "roles",
        action: "create",
        description: "Create roles",
      },
      {
        name: "roles.update",
        resource: "roles",
        action: "update",
        description: "Update roles",
      },
      {
        name: "roles.delete",
        resource: "roles",
        action: "delete",
        description: "Delete roles",
      },
    ];

    await handleResponse({
      res,
      data: permissions,
      message: "Permissions retrieved successfully",
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

export {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getAllPermissions,
};

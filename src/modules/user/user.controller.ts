import type { Request, Response } from "express";
import User from "../../models/User.js";
import { ErrorMessages, SuccessMessages } from "../../common/messages.js";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  handleResponse,
  handlePaginationResponse,
} from "../../common/response.js";
import Role from "../../models/Role.js";

// get data of loggedin user
// GET /api/profile/me
const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return await handleResponse({
        res,
        message: ErrorMessages.ID_REQUIRED,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }
    // finding user in db
    const user = await User.findById(userId)
      .select("-password -_id -__v -created_at -updated_at")
      .populate("role")
      .lean();
    if (!user)
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });

    // sending success response with user data
    await handleResponse({
      res,
      data: user,
      message: SuccessMessages.USER_PROFILE_RETRIEVED,
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
      req,
    });
  }
};

// get all users
// GET /api/v1/users/all
const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Use validated query data if available, otherwise fallback to req.query
    const validatedQuery = (req as any).validatedQuery;
    const page =
      validatedQuery?.page || parseInt(req.query.page as string) || 1;
    const limit =
      validatedQuery?.limit || parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit; // for pagination

    // finding all user
    const allUsers = await User.find({})
      .select("-password -_id -__v -created_at -updated_at")
      .skip(skip)
      .limit(limit)
      .populate("role")
      .lean();

    // count total number of users
    const totalUsers = await User.countDocuments({});
    if (!allUsers)
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });

    // success response
    await handlePaginationResponse({
      res,
      data: allUsers,
      limit,
      total: totalUsers,
      page,
      message: SuccessMessages.USERS_RETRIEVED,
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
      req,
    });
  }
};

// get users by id
// GET /api/v1/users/:id
const getUserById = async (req: Request, res: Response) => {
  // Use validated params data if available, otherwise fallback to req.params
  const validatedParams = (req as any).validatedParams;
  const { id } = validatedParams || req.params;

  try {
    // check if id exist in params
    if (!id)
      return await handleResponse({
        res,
        message: ErrorMessages.ID_REQUIRED,
        status: StatusCodes.BAD_REQUEST,
        error: null,
        req,
      });

    // find user with id
    const user = await User.findById(id)
      .select("-password -_id -__v -created_at -updated_at")
      .populate("role")
      .lean();
    if (!user)
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });

    // sending success response if user found with user data
    await handleResponse({
      res,
      data: user,
      message: SuccessMessages.USER_PROFILE_RETRIEVED,
      status: StatusCodes.OK,
    });
  } catch (error) {
    // console.log(error);
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
      req,
    });
  }
};

// update the user data
// PATCH - /api/user/update/:id
const updateUser = async (req: Request, res: Response) => {
  try {
    // Use validated data if available, otherwise fallback to req properties
    const validatedParams = (req as any).validatedParams;
    const { id } = validatedParams || req.params;
    const { userId, isAdmin: isUserAdmin } = req;

    // if user id not found in request
    if (!userId)
      return await handleResponse({
        res,
        message: ErrorMessages.ID_REQUIRED,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });

    // checking user autharization
    if (userId.toString() !== id && !isUserAdmin) {
      return await handleResponse({
        res,
        message: ErrorMessages.PERMISSION_NOT_FOUND,
        status: StatusCodes.UNAUTHORIZED,
        error: null,
        req,
      });
    }

    // validated by from middleware
    const bodyData = req.body;

    // address type check due to swagger error - with proper validation
    if (bodyData.address && typeof bodyData.address === "string") {
      try {
        // Validate JSON structure before parsing
        const parsedAddress = JSON.parse(bodyData.address);
        if (typeof parsedAddress !== "object" || Array.isArray(parsedAddress)) {
          return await handleResponse({
            res,
            message: ErrorMessages.VALIDATION_FAILED,
            status: StatusCodes.BAD_REQUEST,
            error: "Address must be a valid object",
            req,
          });
        }
        bodyData.address = parsedAddress;
      } catch (error) {
        return await handleResponse({
          res,
          message: ErrorMessages.VALIDATION_FAILED,
          status: StatusCodes.BAD_REQUEST,
          error: "Invalid JSON in address field",
          req,
        });
      }
    }

    // updating the user data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: bodyData,
      },
      {
        new: true,
        runValidators: true,
        select: "-password -_id -__v -created_at -updated_at",
      }
    );

    if (!updatedUser) {
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // sending user success response
    await handleResponse({
      res,
      data: updatedUser,
      message: SuccessMessages.USER_UPDATED,
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: null,
      req,
    });
  }
};

// Delete the user account, normal user can delete his own, admins can delete anyone's
// DELETE - api/user/delete/:id
const deleteUser = async (req: Request, res: Response) => {
  // Use validated params data if available, otherwise fallback to req.params
  const validatedParams = (req as any).validatedParams;
  const { id } = validatedParams || req.params;
  const { userId, isAdmin } = req;

  if (!id || !userId)
    return await handleResponse({
      res,
      message: ErrorMessages.ID_REQUIRED,
      status: StatusCodes.NOT_FOUND,
      error: null,
      req,
    });

  try {
    // id type check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return await handleResponse({
        res,
        message: ErrorMessages.INVALID_USERID,
        status: StatusCodes.BAD_REQUEST,
        error: null,
        req,
      });
    }

    // user validation check
    if (userId.toString() !== id && !isAdmin) {
      return await handleResponse({
        res,
        message: ErrorMessages.PERMISSION_NOT_FOUND,
        status: StatusCodes.UNAUTHORIZED,
        error: null,
        req,
      });
    }

    // deleting the user account
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // sending success response
    await handleResponse({
      res,
      data: null,
      message: SuccessMessages.USER_DELETED,
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
      req,
    });
  }
};

const assignRoleToUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role_id } = req.body;
  try {
    if (!id || !role_id) {
      return await handleResponse({
        res,
        message: ErrorMessages.ID_REQUIRED,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // find user by id
    const user = await User.findById(id);
    if (!user) {
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // find role by id
    const role = await Role.findById(role_id);
    if (!role) {
      return await handleResponse({
        res,
        message: ErrorMessages.ROLE_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }
    if (role.name === "admin") {
      user.is_admin = true;
    } else user.is_admin = false;
    // assign role to user
    user.role = role_id;
    await user.save(); // save the user

    // picking the data to send in response
    const dataTosend = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: role.name,
      is_admin: user.is_admin,
    };
    await handleResponse({
      res,
      data: dataTosend,
      message: SuccessMessages.ROLE_ASSIGNED_TO_USER,
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
      req,
    });
  }
};

const removeRoleFromUser = async (req: Request, res: Response) => {
  const { id } = req.params; // user id
  try {
    if (!id) {
      return await handleResponse({
        res,
        message: ErrorMessages.ID_REQUIRED,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }
    // find user by id
    const user = await User.findById(id);
    if (!user) {
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    user.role = null as any; // remove the role
    user.is_admin = false;
    await user.save(); // save the user

    // picking the data to send in response
    const dataTosend = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
    };

    // send success response
    await handleResponse({
      res,
      data: dataTosend,
      message: SuccessMessages.ROLE_REMOVED_FROM_USER,
      status: StatusCodes.OK,
    });
  } catch (error) {
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
      req,
    });
  }
};

export {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  assignRoleToUser,
  removeRoleFromUser,
};

import type { Request, Response } from "express";
import User from "../../models/User.js";
import {
  ErrorMessages,
  Status,
  SuccessMessages,
} from "../../common/messages.js";
import mongoose from "mongoose";
import { updateUserSchema } from "./schema/update.schema.js";
import { StatusCodes } from "http-status-codes";
import {
  handleResponse,
  handlePaginationResponse,
} from "../../common/response.js";
import Role from "../../models/Role.js";

// get data of loggedin user
// GET /api/users/me
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
    const user = await User.findById(userId).select("-password");
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit; // for pagination

    // finding all user
    const allUsers = await User.find({})
      .select("-password")
      .skip(skip)
      .limit(limit)
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
      // todo use handlePaginationResponse here
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
  const { id } = req.params;

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
    const user = await User.findById(id).select("-password");
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
    const { id } = req.params;
    const { userId, isAdmin: isUserAdmin } = req; // getting from request set by middleware

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

    // address type check due to swagger error - with proper validation
    if (req.body.address && typeof req.body.address === "string") {
      try {
        // Validate JSON structure before parsing
        const parsedAddress = JSON.parse(req.body.address);
        if (typeof parsedAddress !== "object" || Array.isArray(parsedAddress)) {
          return await handleResponse({
            res,
            message: ErrorMessages.VALIDATION_FAILED,
            status: StatusCodes.BAD_REQUEST,
            error: "Address must be a valid object",
            req,
          });
        }
        req.body.address = parsedAddress;
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

    // validating reqbody data
    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return await handleResponse({
        res,
        message: ErrorMessages.VALIDATION_FAILED,
        status: StatusCodes.BAD_REQUEST,
        error: validationResult.error,
        req,
      });
    }

    const validatedData = {
      ...validationResult.data,
      profile_photo: req.file ? req.file.path : undefined,
    };

    // updating the user data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: validatedData,
      },
      {
        new: true,
        runValidators: true,
        select: "-password",
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
  const { id } = req.params;
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
  const { id } = req.params; // user id
  const { roleId } = req.body; // role id
  try {
    if (!id || !roleId) {
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
    const role = await Role.findById(roleId);
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
    user.role = roleId;
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

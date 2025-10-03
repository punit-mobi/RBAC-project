// Schemas are now used in router middleware, not needed in controller
import type { Request, Response } from "express";
import type { MulterRequest } from "../../types/multer.js";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken } from "../../lib/generateToken.js";
import { SuccessMessages, ErrorMessages } from "../../common/messages.js";
import Token from "../../models/Token.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../../common/response.js";
import { syncMasterDataForAuth } from "../../lib/masterDataSync.js";
import User from "../../models/User.js";
import Role from "../../models/Role.js";
import { RegisterResponse } from "../../types/index.js";

// register new user
// POST - /api/v1/auth/register
const registerUser = async (req: MulterRequest, res: Response) => {
  // checks address formating
  if (req.body.address && typeof req.body.address === "string") {
    try {
      req.body.address = JSON.parse(req.body.address);
    } catch (error) {
      return await handleResponse({
        res,
        message: ErrorMessages.VALIDATION_FAILED,
        status: StatusCodes.BAD_REQUEST,
        error: null,
        req,
      });
    }
  }

  // is_admin type for swagger (multipart form data)
  if (req.body.is_admin && typeof req.body.is_admin === "string") {
    req.body.is_admin = req.body.is_admin === "true";
  }

  // req.body is already validated by validateBody middleware
  const { email, password } = req.body;

  try {
    // check if the user already exists
    const isAvailable = await User.findOne({ email });
    if (isAvailable)
      return await handleResponse({
        res,
        message: ErrorMessages.USER_ALREADY_EXISTS,
        status: StatusCodes.CONFLICT,
        error: null,
        req,
      });

    // generate the salt
    const salt = await bcrypt.genSalt(10);

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assign appropriate role based on is_admin flag
    let roleId = null;
    let roleName = null;
    if (req.body.is_admin) {
      const adminRole = await Role.findOne({ name: "admin" });
      if (adminRole) {
        roleId = adminRole._id;
        roleName = adminRole.name;
        console.log(" Assigned Admin role to user");
      }
    } else {
      const viewerRole = await Role.findOne({ name: "viewer" });
      if (viewerRole) {
        roleId = viewerRole._id;
        roleName = viewerRole.name;
      }
    }

    if (!roleId || !roleName) {
      return await handleResponse({
        res,
        message: ErrorMessages.ROLE_ASSIGNMENT_FAILED,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: null,
        req,
      });
    }

    //create the user
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      is_active: true,
      profile_photo: req.file ? req.file.path : "",
      role: roleId,
    });

    if (newUser) {
      //generate token
      const token = generateToken(newUser._id, newUser.is_admin);

      // hiding password for response
      const userResponse = { ...newUser.toObject(), password: undefined };

      // Attempt to sync master data
      // const masterDataSync = await syncMasterDataForAuth();

      // Prepare response data
      const responseData: RegisterResponse = {
        first_name: userResponse.first_name,
        email: userResponse.email,
        is_admin: userResponse.is_admin,
        role: roleName,
      };

      // Add master data if sync was successful
      // if (masterDataSync.success) {
      //   responseData.master_data = masterDataSync.masterData;
      //   responseData.masterDataSyncFailed = "No";
      // } else {
      //   // If master data sync failed, include the failure flag
      //   responseData.masterDataSyncFailed = "Yes";
      //   responseData.master_data = null;
      // }

      // sending token in header
      res.header("Authorization", `Bearer ${token}`);

      // sending response
      await handleResponse({
        res,
        data: responseData,
        message: SuccessMessages.USER_REGISTERED_SUCCESSFULLY,
        status: StatusCodes.OK,
      });
    }
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

// login user
// POST - /api/v1/user/login
const loginUser = async (req: Request, res: Response) => {
  try {
    // req.body is already validated by validateBody middleware
    const { email, password } = req.body;
    // check if user is active and email exists
    const user = await User.findOne({ email, is_active: true });

    if (!user) {
      return await handleResponse({
        res,
        message: ErrorMessages.INVALID_CREDENTIALS_OR_INACTIVE_ID,
        status: StatusCodes.UNAUTHORIZED,
        error: null,
        req,
      });
    }

    // checking password
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword)
      return await handleResponse({
        res,
        message: ErrorMessages.INVALID_CREDENTIALS,
        status: StatusCodes.UNAUTHORIZED,
        error: null,
        req,
      });

    // generate token
    const token = generateToken(user._id, user.is_admin);

    // hiding password
    const userWithoutPassword = { ...user.toObject(), password: undefined };

    // selecting field to send in response
    const sendableData = {
      _id: userWithoutPassword._id,
      first_name: userWithoutPassword.first_name,
      email: userWithoutPassword.email,
      is_admin: userWithoutPassword.is_admin,
    };

    // Attempt to sync master data
    const masterDataSync = await syncMasterDataForAuth();

    // Prepare response data
    const responseData: any = { user: sendableData };

    // Add master data if sync was successful
    if (masterDataSync.success) {
      responseData.master_data = masterDataSync.masterData;
      responseData.masterDataSyncFailed = "No";
    } else {
      // If master data sync failed, include the failure flag
      responseData.masterDataSyncFailed = "Yes";
      responseData.master_data = null;
    }

    res.header("Authorization", `Bearer ${token}`);
    await handleResponse({
      res,
      data: responseData,
      message: SuccessMessages.USER_SIGNIN_SUCCESSFUL,
      status: StatusCodes.OK,
    });
  } catch (error) {
    // console.error("Login error:", error);
    await handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
      req,
    });
  }
};

// reset password, this api just creates the token, stores it in db and send email to respective user
// POST - /api/v1/auth/request-password-reset
const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    // req.body is already validated by validateBody middleware
    const { email } = req.body;
    // finding user in db
    const user = await User.findOne({ email });

    if (!user) {
      return await handleResponse({
        res,
        message: ErrorMessages.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // delete token if already exist for this user
    await Token.deleteOne({ user_id: user._id });

    // creating and adding token to db
    const resetToken = crypto.randomBytes(32).toString("hex");
    await new Token({
      user_id: user._id,
      token: resetToken,
    }).save();

    // send email to user
    const resetLink = `http://localhost:${process.env.PORT}/api/v1/auth/reset-password/${resetToken}`;
    console.log("Password Reset Link:", resetLink);

    const subject = "Password Reset Request";
    const html = `<p>Hi ${user.first_name || "User"},</p>
                  <p>Your reset password link is here, Please click the link below to set a new password:</p>
                  <a href="${resetLink}">Reset Password</a>
               `;

    await sendEmail(user.email, subject, html);

    // success response
    await handleResponse({
      res,
      data: null,
      message: SuccessMessages.PASSWORD_RESET_LINK_SENT,
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

// for resetting the password, here the password actually resets after getting link from email, (token is sent to email)
// POST - /api/v1/auth/reset-password/:token
const resetPassword = async (req: Request, res: Response) => {
  try {
    // req.body is already validated by validateBody middleware
    const { password } = req.body;
    const { token } = req.params;

    // find token from db
    const resetToken = await Token.findOne({ token });
    if (!resetToken) {
      return await handleResponse({
        res,
        message: ErrorMessages.INVALID_CREDENTIALS,
        status: StatusCodes.BAD_REQUEST,
        error: null,
        req,
      });
    }

    // generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // updating the password
    await User.updateOne(
      { _id: resetToken.user_id },
      { $set: { password: hashedPassword } }
    );

    // delete token after password update
    await Token.deleteOne({ _id: resetToken._id });

    // sending success response
    await handleResponse({
      res,
      data: null,
      message: SuccessMessages.PASSWORD_RESET,
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

export { registerUser, loginUser, requestPasswordReset, resetPassword };

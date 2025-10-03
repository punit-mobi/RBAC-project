import type { Request, Response } from "express";
import { Post } from "../../models/Post.js";
import { ErrorMessages, SuccessMessages } from "../../common/messages.js";
import { StatusCodes } from "http-status-codes";
import {
  handlePaginationResponse,
  handleResponse,
} from "../../common/response.js";
import { createPostSchema } from "./schemas/create.schema.js";

// get post by id
// GET - /api/v1/posts/:id
async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id)
      return await handleResponse({
        res,
        message: ErrorMessages.ID_REQUIRED,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });

    const post = await Post.findById(id);
    if (!post)
      return await handleResponse({
        res,
        message: ErrorMessages.POST_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    await handleResponse({
      res,
      data: post,
      message: SuccessMessages.POSTS_RETRIEVED,
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
}

// get all posts
// GET - /api/v1/posts
async function getAllPosts(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({}).skip(skip).limit(limit).lean();

    const totalPosts = await Post.countDocuments({});
    if (!posts) {
      return await handleResponse({
        res,
        message: ErrorMessages.POST_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }
    // success response
    await handlePaginationResponse({
      res,
      data: posts,
      limit,
      total: totalPosts,
      page,
      message: SuccessMessages.POSTS_RETRIEVED,
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
}

// create post
// POST - /api/v1/posts
async function createPost(req: Request, res: Response) {
  try {
    const parsedData = createPostSchema.safeParse(req.body);
    if (!parsedData.success) {
      return await handleResponse({
        res,
        message: ErrorMessages.VALIDATION_FAILED,
        status: StatusCodes.BAD_REQUEST,
        error: parsedData.error,
        req,
      });
    }

    const { title, content } = parsedData.data;
    const newPost = await Post.create({ title, content, author: req.userId });
    await handleResponse({
      res,
      data: newPost,
      message: SuccessMessages.POST_CREATED,
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
}

// delete post
// DELETE - /api/v1/posts/:id
async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
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
    const post = await Post.findById(id);
    if (!post) {
      return await handleResponse({
        res,
        message: ErrorMessages.POST_NOT_FOUND,
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // check if post author is the same as the user id
    if (post.author.toString() !== userId.toString() && !req.isAdmin) {
      return await handleResponse({
        res,
        message: ErrorMessages.INSUFFICIENT_PERMISSIONS,
        status: StatusCodes.FORBIDDEN,
        error: null,
        req,
      });
    }

    // delete the post
    await Post.findByIdAndDelete(id);

    await handleResponse({
      res,
      data: null,
      message: SuccessMessages.POST_DELETED,
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
}

export { getAllPosts, createPost, deletePost, getPostById };

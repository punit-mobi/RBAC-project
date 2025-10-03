import type { Request, Response } from "express";
import logErrorToDB from "../lib/LogError.js";

interface HandleResponseProps<T> {
  res: Response;
  data?: T;
  message: string;
  status?: number;
  error?: any;
  req?: Request; // Optional, only needed for error logging
}

interface HandleAPIResponse<T> {
  status: boolean;
  status_code: number;
  message: string;
  data?: T;
  error?: any;
}

export async function handleResponse<T>({
  res,
  data,
  message,
  status = 200,
  error,
  req,
}: HandleResponseProps<T>) {
  const isSuccess = status < 400;

  // Log error to database if it's an error response and req is provided
  if (!isSuccess && error && req) {
    await logErrorToDB(req, error, message);
  }

  res.status(status).json({
    status: isSuccess,
    status_code: status,
    message,
    ...(isSuccess ? { data } : { error: error || null }),
  } as HandleAPIResponse<T>);
}

interface HandlePaginationResponseProps<T> {
  res: Response;
  data: T;
  limit: number;
  total: number;
  page: number;
  message: string;
  status?: number;
}

interface HandleAPIPaginationResponse<T> {
  status: boolean;
  status_code: number;
  message: string;
  data: T;
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function handlePaginationResponse<T>({
  res,
  data,
  limit,
  total,
  page,
  message,
  status = 200,
}: HandlePaginationResponseProps<T>) {
  res.status(status).json({
    status: true,
    status_code: status,
    message,
    data,
    page,
    limit,
    total,
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  } as HandleAPIPaginationResponse<T>);
}

import type { Request, Response } from "express";
import MasterData from "../../models/MasterData.js";
import { ErrorMessages, SuccessMessages } from "../../common/messages.js";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../../common/response.js";

// Get all master data
// GET /api/master-data
const getMasterData = async (req: Request, res: Response) => {
  try {
    const { data_type, is_active } = req.query;

    // Build query filter
    const filter: any = {};
    if (data_type) {
      filter.data_type = data_type;
    }
    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    // Fetch master data
    const masterData = await MasterData.find(filter)
      .select("-__v")
      .sort({ data_type: 1, data_key: 1 })
      .lean();

    // Transform data for better structure
    const transformedData = masterData.reduce((acc: any, item) => {
      if (!acc[item.data_type]) {
        acc[item.data_type] = {};
      }
      acc[item.data_type][item.data_key] = {
        ...item.data_value,
        description: item.description,
        version: item.version,
        last_synced: item.last_synced,
        is_active: item.is_active,
      };
      return acc;
    }, {});

    await handleResponse({
      res,
      data: {
        master_data: transformedData,
        total_records: masterData.length,
        last_updated: new Date(),
      },
      message: SuccessMessages.COMMON_DATA_RETRIEVED,
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

// Sync master data (simulate sync process)
// POST /api/master-data/sync
const syncMasterData = async (req: Request, res: Response) => {
  try {
    // Simulate sync process with potential failure
    const syncSuccess = Math.random() > 0.2; // 80% success rate for demo

    if (!syncSuccess) {
      // Simulate sync failure
      return await handleResponse({
        res,
        message: "Master data sync failed",
        status: StatusCodes.SERVICE_UNAVAILABLE,
        error: null,
        req,
      });
    }

    // Update last_synced timestamp and increment version for all active records
    await MasterData.updateMany(
      { is_active: true },
      {
        $set: {
          last_synced: new Date(),
        },
        $inc: {
          version: 1,
        },
      }
    );

    // Get updated master data
    const masterData = await MasterData.find({ is_active: true })
      .select("-__v")
      .sort({ data_type: 1, data_key: 1 })
      .lean();

    // Transform data
    const transformedData = masterData.reduce((acc: any, item) => {
      if (!acc[item.data_type]) {
        acc[item.data_type] = {};
      }
      acc[item.data_type][item.data_key] = {
        ...item.data_value,
        description: item.description,
        version: item.version,
        last_synced: item.last_synced,
        is_active: item.is_active,
      };
      return acc;
    }, {});

    await handleResponse({
      res,
      data: {
        master_data: transformedData,
        sync_status: "success",
        last_synced: new Date(),
        total_records: masterData.length,
      },
      message: "Master data synchronized successfully",
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

// Get master data by type
// GET /api/master-data/:type
const getMasterDataByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { is_active } = req.query;

    const filter: any = { data_type: type };
    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    const masterData = await MasterData.find(filter)
      .select("-__v")
      .sort({ data_key: 1 })
      .lean();

    if (masterData.length === 0) {
      return await handleResponse({
        res,
        message: "No master data found for the specified type",
        status: StatusCodes.NOT_FOUND,
        error: null,
        req,
      });
    }

    // Transform data for the specific type
    const transformedData = masterData.reduce((acc: any, item) => {
      acc[item.data_key] = {
        ...item.data_value,
        description: item.description,
        version: item.version,
        last_synced: item.last_synced,
        is_active: item.is_active,
      };
      return acc;
    }, {});

    await handleResponse({
      res,
      data: {
        data_type: type,
        data: transformedData,
        total_records: masterData.length,
      },
      message: SuccessMessages.COMMON_DATA_RETRIEVED,
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

export { getMasterData, syncMasterData, getMasterDataByType };

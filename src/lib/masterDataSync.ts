import MasterData from "../models/MasterData.js";

// Helper function to sync master data
export const syncMasterDataForAuth = async (): Promise<{
  success: boolean;
  masterData?: any;
  error?: string;
}> => {
  try {
    // Simulate sync process with potential failure
    const syncSuccess = Math.random() > 0.1; // 90% success rate for demo

    if (!syncSuccess) {
      return {
        success: false,
        error: "Master data sync failed",
      };
    }

    // Get all active master data
    const masterData = await MasterData.find({ is_active: true })
      .select("-__v")
      .sort({ data_type: 1, data_key: 1 })
      .lean();

    // Check if master data exists
    if (!masterData || masterData.length === 0) {
      return {
        success: false,
        error: "No master data found to sync",
      };
    }

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

    // Update last_synced timestamp and increment version
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

    return {
      success: true,
      masterData: {
        master_data: transformedData,
        total_records: masterData.length,
        last_synced: new Date(),
      },
    };
  } catch (error) {
    console.error("Master data sync error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Internal error during master data sync",
    };
  }
};

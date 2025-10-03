import express from "express";
import {
  getMasterData,
  syncMasterData,
  getMasterDataByType,
} from "./masterData.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/master-data:
 *   get:
 *     summary: Get all master data
 *     description: Retrieve all master data including roles, permissions, modules, and configurations
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data_type
 *         schema:
 *           type: string
 *           enum: [roles, permissions, modules, configurations]
 *         description: Filter by data type
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Master data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 status_code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Common data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     master_data:
 *                       type: object
 *                       description: Master data organized by type
 *                     total_records:
 *                       type: number
 *                       example: 12
 *                     last_updated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 */
router.get("/", getMasterData);

/**
 * @swagger
 * /api/master-data/sync:
 *   post:
 *     summary: Synchronize master data
 *     description: Sync master data and return updated data. May fail occasionally for testing purposes.
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Master data synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 status_code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Master data synchronized successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     master_data:
 *                       type: object
 *                     sync_status:
 *                       type: string
 *                       example: "success"
 *                     last_synced:
 *                       type: string
 *                       format: date-time
 *                     total_records:
 *                       type: number
 *       503:
 *         description: Master data sync failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 status_code:
 *                   type: number
 *                   example: 503
 *                 message:
 *                   type: string
 *                   example: "Master data sync failed"
 *                 masterDataSyncFailed:
 *                   type: string
 *                   example: "Yes"
 */
router.post("/sync", syncMasterData);

/**
 * @swagger
 * /api/master-data/{type}:
 *   get:
 *     summary: Get master data by type
 *     description: Retrieve master data filtered by specific type (roles, permissions, modules, configurations)
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [roles, permissions, modules, configurations]
 *         description: Type of master data to retrieve
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Master data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 status_code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Common data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data_type:
 *                       type: string
 *                       example: "roles"
 *                     data:
 *                       type: object
 *                       description: Master data for the specified type
 *                     total_records:
 *                       type: number
 *                       example: 3
 *       404:
 *         description: No master data found for the specified type
 *       500:
 *         description: Internal server error
 */
router.get("/:type", getMasterDataByType);

export { router as masterDataRouter };

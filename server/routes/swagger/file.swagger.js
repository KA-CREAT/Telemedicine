/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File management APIs
 */

/**
 * @swagger
 * /api/file/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */

/**
 * @swagger
 * /api/file/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
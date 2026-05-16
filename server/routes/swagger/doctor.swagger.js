/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management APIs
 */

/**
 * @swagger
 * /api/doctor/getalldoctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 */

/**
 * @swagger
 * /api/doctor/getnotdoctors:
 *   get:
 *     summary: Get users who are not doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Non-doctor users fetched successfully
 */

/**
 * @swagger
 * /api/doctor/applyfordoctor:
 *   post:
 *     summary: Apply for doctor account
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctor application submitted successfully
 */

/**
 * @swagger
 * /api/doctor/deletedoctor:
 *   put:
 *     summary: Delete doctor
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 */

/**
 * @swagger
 * /api/doctor/acceptdoctor:
 *   put:
 *     summary: Accept doctor application
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctor application accepted
 */

/**
 * @swagger
 * /api/doctor/rejectdoctor:
 *   put:
 *     summary: Reject doctor application
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctor application rejected
 */
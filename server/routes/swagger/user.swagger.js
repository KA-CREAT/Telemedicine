/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/user/getuser/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully
 */

/**
 * @swagger
 * /api/user/getallusers:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /api/user/forgotpassword:
 *   post:
 *     summary: Send forgot password email
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password reset email sent
 */

/**
 * @swagger
 * /api/user/resetpassword/{id}/{token}:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

/**
 * @swagger
 * /api/user/updateprofile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /api/user/changepassword:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password changed successfully
 */

/**
 * @swagger
 * /api/user/deleteuser:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
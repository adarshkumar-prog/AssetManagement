const express = require('express');
const authRouter = express.Router();
const authController = require("../controllers/authController");

///Register a new user
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: This endpoint allows a new user to register.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRouter.post("/api/auth/register", authController.register);

// User login (returns JWT token)
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 */

authRouter.post("/api/auth/login", authController.login); 

module.exports = authRouter;

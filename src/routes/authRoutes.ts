import express from "express"
import { register, login, verifyToken } from "../controllers/authController"

const router = express.Router()

// Routes
router.post("/register", register)
router.post("/login", login)
router.post("/verify", verifyToken)

export default router

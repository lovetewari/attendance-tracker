import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, name } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" })
    }

    // Create new user
    const newUser = new User({
      username,
      password, // Will be hashed in the pre-save hook
      email,
      name,
    })

    const savedUser = await newUser.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Return user data without password
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      name: savedUser.name,
    }

    res.status(201).json({ token, user: userResponse })
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    // Find user
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    // Return user data without password
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    }

    res.status(200).json({ token, user: userResponse })
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message })
  }
}

// Verify token
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string }

    // Find user
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ user })
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" })
    }

    res.status(500).json({ message: "Error verifying token", error: error.message })
  }
}

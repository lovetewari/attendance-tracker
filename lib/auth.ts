import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "nm-decor-secret-key-2025"

// Generate a JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

// Verify a JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Token verification error:", error)
    return null // Return null instead of throwing an error
  }
}

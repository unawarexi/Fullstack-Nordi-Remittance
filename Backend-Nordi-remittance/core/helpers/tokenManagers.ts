import jwt from "jsonwebtoken";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Generates a JWT token with the given payload and expiry.
 * @param payload - The payload to encode in the token.
 * @param expiresIn - Expiry time (e.g., "1d", "1h").
 * @returns The signed JWT token.
 */
export function generateToken(payload: object, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 * @param token - The JWT token to verify.
 * @returns The decoded payload or null if invalid.
 */
export function verifyToken(token: string): object | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return typeof decoded === "object" && decoded !== null ? decoded : null;
  } catch {
    return null;
  }
}

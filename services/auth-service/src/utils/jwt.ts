import jwt from "jsonwebtoken";

export function generateToken(user: any) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      version: user.version,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );
}
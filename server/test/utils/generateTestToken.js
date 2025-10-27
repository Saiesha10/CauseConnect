import jwt from "jsonwebtoken";

export function genToken(payload = { id: "user-1", email: "test@a.com", role: "USER" }) {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET || "test-secret", { expiresIn: "2h" });
}

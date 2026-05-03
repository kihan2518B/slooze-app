/**
 * Edge-compatible JWT verification using the `jose` library.
 *
 * The `jsonwebtoken` package relies on Node.js-only APIs (crypto, Buffer, etc.)
 * and CANNOT run in the Edge Runtime that Next.js middleware uses.
 * This module uses `jose` which is built on the Web Crypto API and works in
 * both Node.js and Edge environments.
 */
import { JWTPayload } from "@/types";
import { jwtVerify } from "jose";

/**
 * Verify a JWT token in the Edge Runtime.
 * Uses the same JWT_SECRET as the Node.js `jsonwebtoken` signer.
 */
export async function verifyTokenEdge(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret-key-change-in-production",
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (e) {
    console.error("Edge token verification failed:", e);
    return null;
  }
}

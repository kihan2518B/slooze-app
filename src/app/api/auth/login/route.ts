import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/api-helpers";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid credentials", 422);

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return apiError("Invalid email or password", 401);

    const valid = await comparePassword(password, user.password);
    if (!valid) return apiError("Invalid email or password", 401);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      country: user.country,
      restaurantId: user.restaurantId,
      name: user.name,
    });
    const response = apiResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        restaurantId: user.restaurantId,
      },
      token,
    });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error(err);
    return apiError("Login failed", 500);
  }
}

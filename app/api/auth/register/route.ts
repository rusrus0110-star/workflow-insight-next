import { NextRequest, NextResponse } from "next/server";

import { COOKIE_NAME, HTTP_STATUS } from "@/lib/constants";
import { errorResponse } from "@/lib/api_response";
import { registerUser } from "@/services/auth_service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { token, user } = await registerUser(body);

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: user,
      },
      { status: HTTP_STATUS.CREATED },
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Registration failed",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}

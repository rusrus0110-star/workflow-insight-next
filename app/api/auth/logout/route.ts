import { NextResponse } from "next/server";

import { COOKIE_NAME, HTTP_STATUS } from "@/lib/constants";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logout successful",
    },
    { status: HTTP_STATUS.OK },
  );

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

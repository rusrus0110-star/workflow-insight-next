import { NextResponse } from "next/server";

export const successResponse = <T>(
  data: T,
  message = "Success",
  status = 200,
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
};

export const errorResponse = (
  message = "Something went wrong",
  status = 500,
  details?: unknown,
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    { status },
  );
};

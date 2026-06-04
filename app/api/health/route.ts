import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";

export async function GET() {
  try {
    await connectDb();

    return NextResponse.json({
      success: true,
      message: "Workflow Insight API is running",
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

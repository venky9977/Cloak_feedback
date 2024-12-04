import { NextRequest, NextResponse } from "next/server"; // Use NextResponse for API routes
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

// Zod schema for validating the query parameter
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // Validate query parameters using Zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      // Extract errors if validation fails
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Check if the username already exists and is verified
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    // Username is available
    return NextResponse.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 } 
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "@/model/User"; // Import your User type

interface DeleteMessageParams {
  messageid: string;
}

export async function DELETE(
  req: NextRequest, // Correctly typed NextRequest
  { params }: { params: Promise<DeleteMessageParams> } // Wrap params in Promise
) {
  // Ensure params is resolved
  const { messageid } = await params; // Await the Promise for params

  // Connect to DB
  await dbConnect();

  // Get the session using getToken (for JWT-based session)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user) {
    return NextResponse.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  const user = token.user as User;

  try {
    // Attempt to delete the message
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message Deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in delete message route", error);
    return NextResponse.json(
      { success: false, message: "Error deleting message" },
      { status: 500 }
    );
  }
}

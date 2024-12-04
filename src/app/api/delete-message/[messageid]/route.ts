import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

interface DeleteMessageParams {
  messageid: string;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<DeleteMessageParams> }
) {
  const { messageid } = await params;

  // Connect to DB
  await dbConnect();

  // Get the token using getToken
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Token:", token); // For debugging

  // Extract the user ID from token
  const userId = token?.sub || token?._id;

  if (!token || !userId) {
    return NextResponse.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  try {
    // Attempt to delete the message
    const updateResult = await UserModel.updateOne(
      { _id: userId },
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

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  try {
    // Retrieve session and user details
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Not Authenticated",
        }),
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId((session.user as any)._id);

    // Retrieve user messages
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    // Handle empty user or messages
    if (!user || user.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          messages: [],
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages: user[0].messages,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred: ", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
}

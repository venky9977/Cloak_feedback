import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    const { username, content } = await request.json();

    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not found",
                }),
                { status: 404 }
            );
        }

        // If user is not accepting messages, return a message
        if (!user.isAcceptingMessages) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User is not accepting messages",
                }),
                { status: 403 }
            );
        }

        // Add the new message to the user's messages
        const newMessage = { content, createdAt: new Date() };
        user.messages.push(newMessage);
        await user.save();

        return new Response(
            JSON.stringify({
                success: true,
                message: "Message sent successfully",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending message:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500 }
        );
    }
}

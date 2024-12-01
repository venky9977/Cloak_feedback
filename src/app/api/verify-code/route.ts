import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { tree } from "next/dist/build/templates/app-page";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username, code} = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 500 }
            )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return Response.json(
                {
                    success: true,
                    message: "Account Verified Successfully"
                },
                { status: 200 }
            )
        } else if(!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired. Please signup again!"
                },
                { status: 400 }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification Code"
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("Error verifying user", error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },
            { status: 500 }
        )
    }
}
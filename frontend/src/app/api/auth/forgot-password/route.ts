import { NextRequest, NextResponse } from "next/server";
import { getCsrfToken } from "../../../../../lib/frontend";
import { checkCsrfToken, host } from "../../../../../lib/auth";
import { changePassword, createToken, getUserIDFromEmail } from "../../../../../lib/mongodb";
import { generateSecureTempPassword } from "../../../../../lib/security";
import { sendEmail } from "../../../../../lib/nodemailer";


export async function POST(req:NextRequest) {
    // Allows users to request a new password
    const {email} = await req.json();

    try{
        // fetch DB to get UserID according to the PSW
        const _id = await getUserIDFromEmail(email)
        if(_id==null){
            return new NextResponse("Success", {status: 200})
        }
        else{
            //change the PSW
            const {success, token} = await createToken(_id);
            // send email to the user
            sendEmail({to:email, subject: "Password Reset", text: `You requested a new password. Use the following link to create a new password ${host+"/reset-password?token="+token}`})
            if(!success){
                console.log("Error when changing password")
                return new NextResponse("Server Error", {status: 500})
            }
            return new NextResponse("Success", {status: 200})

        }
    }
    catch(error){
        console.error(error)
        return new NextResponse("Server Error", {status: 500})
    }

}
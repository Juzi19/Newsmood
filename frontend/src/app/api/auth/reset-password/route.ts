import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "../../../../../lib/mongodb";

export async function POST(req: NextRequest){
    const {token, password} = await req.json();
    const {success} = await resetPassword(token, password)
    if(success){
        return new NextResponse("Password changed successfully", {status: 200});

    }
    else{
        return new NextResponse("Internal error occured or token invalid", {status: 418});

    }

}
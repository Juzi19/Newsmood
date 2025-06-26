import { NextRequest, NextResponse } from "next/server";
import { getCsrfToken } from "../../../../../lib/frontend";
import { checkCsrfToken } from "../../../../../lib/auth";
import { resetPassword } from "../../../../../lib/mongodb";

export async function POST(req: NextRequest){
    const {token, password} = await req.json();
    const csrfToken = getCsrfToken(req);

    if (!csrfToken){
        return new NextResponse("CSRF Token missing", {status: 401});
    }

    if(await checkCsrfToken(csrfToken)){
        // check token and update password
        const {success} = await resetPassword(token, password)
        if(success){
            return new NextResponse("Password changed successfully", {status: 200});

        }
        else{
            return new NextResponse("Internal error occured or token invalid", {status: 418});

        }
    }
    else{
        return new NextResponse("Wrong csrf Token", {status: 401});
    }


}
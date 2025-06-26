import { NextRequest, NextResponse } from "next/server";
import { getCsrfToken } from "../../../../../lib/frontend";
import { createUser, identificateUser, UserEntry } from "../../../../../lib/mongodb";
import { checkCsrfToken, host, login } from "../../../../../lib/auth";
import { rateLimitingLogin } from "../../../../../lib/security";

type LoginDataType = {
    data:{
        email:string,
        password:string
    }
}

export async function POST(req:NextRequest){
    const {data}:LoginDataType= await req.json();
    const csrfToken = getCsrfToken(req);
    if (!csrfToken){
        return NextResponse.redirect('/login')
    }
    //check csrfToken
    if (await checkCsrfToken(csrfToken)){
        if(await rateLimitingLogin(data.email)){
            const state = (await identificateUser(data.email, data.password))!
            if(state.identification){
                await login(state.user!._id.toString())
                return NextResponse.json({"login": true}, {status: 200})
            }
            else{
                return NextResponse.json({"login": false}, {status: 403})
            }
        }
        else{
            return new NextResponse("Acces Denied - please try again in a few seconds", {status: 401})
        }

    }
    return NextResponse.json({"message": "CSRFTOKEN invalid"}, {status: 401})
}
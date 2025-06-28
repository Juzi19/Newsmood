import { NextRequest, NextResponse } from "next/server";
import { identificateUser} from "../../../../../lib/mongodb";
import { login } from "../../../../../lib/auth";
import { rateLimitingLogin } from "../../../../../lib/security";

type LoginDataType = {
    data:{
        email:string,
        password:string
    }
}

export async function POST(req:NextRequest){
    const {data}:LoginDataType= await req.json();
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
        return new NextResponse("Acces Denied - please try again in a few seconds", {status: 429})
    }
}
import { NextRequest, NextResponse } from "next/server";
import { checkCsrfToken, getUserID, isloggedIn } from "../../../../../lib/auth";
import { getCsrfToken } from "../../../../../lib/frontend";
import { changeUsername } from "../../../../../lib/mongodb";

export async function PUT(req:NextRequest) {
    const {id, username}: {id:string, username:string} = await req.json();
    const csrfToken = getCsrfToken(req);
    if (!csrfToken){
        return new NextResponse("CSRF Token missing", {status: 403});
    }
    //check if user is logged in and has a csrfToken
    console.log(username)
    console.log(id, await getUserID())
    if(await isloggedIn() && await checkCsrfToken(csrfToken) && id == await getUserID()){
        //apply changes in the DB
        const status = await changeUsername(id, username);
        if(!status.success){
            return new NextResponse("Internal Error when trying to update the DB", {status: 500})
        }
        else{
            return new NextResponse("Username changes successfully", {status: 200})
        }
    }
    else
    {
        return new NextResponse("Access Denied - bad credentials, hahaha nice try", {status: 418})
    }

}
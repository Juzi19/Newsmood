import { NextRequest, NextResponse } from "next/server";
import { getUserID, isloggedIn } from "../../../../../lib/auth";
import { changeUsername } from "../../../../../lib/mongodb";

export async function PUT(req:NextRequest) {
    try{
        const {id, username}: {id:string, username:string} = await req.json();
        if(await isloggedIn() && id == await getUserID()){
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
        catch(exception){
            console.warn(`Exception occured ${exception}`)
            return new NextResponse("Exception occured", {status: 400})

        }

}
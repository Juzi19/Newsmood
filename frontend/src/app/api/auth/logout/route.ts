import { NextResponse } from "next/server";
import { logout } from "../../../../../lib/auth";

//logout the user
export async function POST(){
    try{
        logout();
        return new NextResponse("User is logged out", {status: 200});
    }
    catch(error){
        console.warn("Error when logging out", error);
        return new NextResponse("Error logout", {status: 500});
    }
    
}
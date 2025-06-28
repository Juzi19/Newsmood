import { NextResponse } from "next/server";
import { logout } from "../../../../../lib/auth";
import { host } from "../../../../../lib/auth";

//logout the user
export async function POST(){
    logout();
    return NextResponse.redirect(host+'/login')
}
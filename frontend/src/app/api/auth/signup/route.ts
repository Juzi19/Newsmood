import { NextRequest, NextResponse } from "next/server";
import { login } from "../../../../../lib/auth";
import { createUser, UserEntry } from "../../../../../lib/mongodb";
import { randomInt } from "crypto";
import sanitize from 'mongo-sanitize';
import { hashPassword } from "../../../../../lib/mongodb";

// Create user account
export async function POST(req:NextRequest){
    const {data} = await req.json();

    //extract key values from the request
    const {email, username, password} = data;

    // creating a new User Entry and sanitizing data
    const newUserEntry:UserEntry = {
        username: sanitize(username),
        email: sanitize(email.trim().toLowerCase()), 
        password: await hashPassword(sanitize(password)),
        email_pin: randomInt(1000,10000),
        email_confirmed: false,
        searches: []
    }
    
    //create User entry
    const userData = await createUser(newUserEntry);

    //checks user entry
    if(userData.success){
        console.log("User created successfully", userData.insertedId)
        // authetificate the newly created user
        login(userData.insertedId!.toString())
        //if user was created successfully
        return NextResponse.json({"message":"Benutzer erfolgreich erstellt"}, {status: 201})
    }
    else{
        return NextResponse.json({"message": userData.error}, {status: 400})
    }

}
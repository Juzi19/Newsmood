import { NextRequest, NextResponse } from "next/server";
import { getCsrfToken } from "../../../../../lib/frontend";
import { checkCsrfToken, getUserID } from "../../../../../lib/auth";
import clientPromise from "../../../../../lib/mongodb";
import { UserEntry } from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

//validates email pin and confirm email
export async function POST(req:NextRequest) {
    const {data} = await req.json();
    const csrfToken = getCsrfToken(req);
    if (!csrfToken){
        return NextResponse.redirect('/login')
    }
    //check csrfToken
        if (await checkCsrfToken(csrfToken)){
            const client = await clientPromise;
            const db = client.db("UserDB");
            const usersCollection = db.collection<UserEntry>("users");
            const userId= new ObjectId((await getUserID())!);
            const existingUser = await usersCollection.findOne({ _id:userId });

            if(existingUser?.email_pin == data.emailPin && existingUser){
                await usersCollection.updateOne(
                    { _id: userId }, // filter
                    { $set: { email_confirmed: true } } // update
                  );
                
                return NextResponse.json({message: "Email confirmed"}, {status: 200})
            }
            else{
                return NextResponse.json({"message": "Wrong PIN"}, {status: 403})
            }

        }

    return NextResponse.json({"message": "CSRF Token invalid"},{status: 400})
}
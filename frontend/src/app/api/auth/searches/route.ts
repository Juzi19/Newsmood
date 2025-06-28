import { NextRequest, NextResponse } from "next/server";
import { getCsrfToken } from "../../../../../lib/frontend";
import { checkCsrfToken, isloggedIn } from "../../../../../lib/auth";
import clientPromise from "../../../../../lib/mongodb";
import { UserEntry } from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserID } from "../../../../../lib/auth";
import sanitize from "mongo-sanitize";


// creating new Searches
export async function POST(req:NextRequest){
    const {data} = await req.json();
        if (await isloggedIn()){
            // fetch the user from the database

            // await mongo client
            const client = await clientPromise;
            const db = client.db("UserDB");
            const usersCollection = db.collection<UserEntry>("users");
            const userId = await getUserID();
            const id = new ObjectId(userId!);
            const {searches} = (await usersCollection.findOne({ _id:id }))!;
            
            //add new search to mongo and encode it
            searches.push(encodeURIComponent(sanitize(data.name)));

            // create new Seach to the searches array
            await usersCollection.updateOne(
                { _id: id }, // filter
                { $set: { searches: searches } } // update
              );

            return NextResponse.json({"message": "Neue Suche erfolgreich hinzugefügt"}, {status: 200})
            
    
        }
        return NextResponse.json({"message": "CSRFTOKEN invalid or user not logged in"}, {status: 400})
    
}

// Deleting searches
export async function DELETE(req:NextRequest){
    const {data} = await req.json();
    const csrfToken = getCsrfToken(req);
    if (!csrfToken){
        return NextResponse.redirect('/login')
    }

    //check csrfToken
        if (await checkCsrfToken(csrfToken) && await isloggedIn()){
            // fetch the user from the database
            const client = await clientPromise;
            const db = client.db("UserDB");
            const usersCollection = db.collection<UserEntry>("users");
            const userId = await getUserID();
            const id = new ObjectId(userId!);
            let {searches} = (await usersCollection.findOne({ _id:id }))!;
            
            //remove the search from the user searches
            searches = searches.filter(item => item!==sanitize(data.name));

            // create new Seach to the searches array
            await usersCollection.updateOne(
                { _id: id }, // filter
                { $set: { searches: searches } } // update
              );

            return NextResponse.json({"message": "Suche gelöscht"}, {status: 200})
            
    
        }
        return NextResponse.json({"message": "CSRFTOKEN invalid or user not authitificated"}, {status: 400})
    
}
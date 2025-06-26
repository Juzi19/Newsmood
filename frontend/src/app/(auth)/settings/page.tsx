// SSR

import { getUserID } from "../../../../lib/auth"
import { getUserData, UserEntry } from "../../../../lib/mongodb"
import ProfileChanges from "@/components/ProfileChanges";

export default async function Settings(){
    //query mongo DB for user information
    const userID = await getUserID();
    const userCollection:UserEntry|null = await getUserData(userID!)
    if(!userCollection){
        console.error("Critical DB error. Loophole in the Auth System. UserID", userID, "can authentificate itself without proper login/account.")
        return(
            <div>
                Error
            </div>
        )
    }


    return(
        <div className="w-full text-center my-4 flex items-center flex-col">
            <h1 className="font-bold text-2xl">Einstellungen für {userCollection.email}</h1>
            <ProfileChanges _id={userCollection._id!.toString()} username={userCollection.username}></ProfileChanges>
            <img src="/gear.jpg" alt="Settings" className="max-w-[30vh]" />
        </div>
    )
}
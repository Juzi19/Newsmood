import Link from "next/link";
import { getUserID } from "../../../../lib/auth";
import clientPromise from "../../../../lib/mongodb"
import { UserEntry } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";


import {Geist_Mono} from 'next/font/google';

const geistmono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-geist-mono'
})


export default async function Searches(){
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");
    const userId = await getUserID();
    const id = new ObjectId(userId!);
    const user = await usersCollection.findOne({ _id: id });
    // extract searches object
    const {searches} = user!;

    return(
        <div className="flex flex-col justify-center items-center w-full min-h-[90vh]">
            <h1 className="text-xl mb-2">Deine Suchen:</h1>
            {searches.map((search, index)=>{
                return(
                    <Link href={`/searches/${encodeURIComponent(search)}`} key={index} className={`p-2 m-1 bg-black text-gray-50 rounded-xl min-w-1/6 text-center hover:opacity-80 ${geistmono.className}`}>{decodeURIComponent(search)}</Link>
                )
            })}
            {/* Add searches button (less than 10 searches) */}
            <p className="text-xl my-2">oder</p>
            <Link href="/searches/add" className={`bg-amber-300 p-2 rounded-xl ${geistmono.className} mt-1 hover:opacity-80`}>Neue Suche erstellen</Link>
        </div>
    )
}
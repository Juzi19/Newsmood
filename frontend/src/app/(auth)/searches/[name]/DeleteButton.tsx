"use client"

import { getCookie } from "../../../../../lib/frontend";
import { useRouter } from "next/navigation";

export default function DeleteButton({searchName}:{searchName:string}){
    const router = useRouter();
    
    async function handleClick() {
        //logic to fetch api
        const csrfToken = getCookie("csrfToken", document);
        const response = await fetch("/api/auth/searches", {
            method: "DELETE",
            body: JSON.stringify({data: {name: decodeURIComponent(searchName)}}),
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken!
            }
        });
        if(response.ok){
            router.push('/searches')
        }
        else{
            console.log("Error when trying to delete the search")
        }
    }
    return(
        <div onClick={handleClick} className="bg-black p-2 rounded-xl fixed bottom-2 right-2 text-gray-50 font-bold hover:opacity-80 cursor-pointer">
            Lösche Suchbegriff ❌
        </div>
    )
}
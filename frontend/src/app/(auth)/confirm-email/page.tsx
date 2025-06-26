"use client"

import { useState } from "react"
import { getCookie } from "../../../../lib/frontend";
import { useRouter } from "next/navigation";

export default function ConfirmEmail(){
    const [message, setMessage] = useState("");
    const router= useRouter();

    async function handleSubmit(e:any) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const pin = formData.get('emailPin');
        const csrfToken = getCookie('csrfToken', document);

        console.log("Fetching")

        const res = await fetch('api/auth/confirm-email', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken ?? '',
            },
            body: JSON.stringify({"data": {
                "emailPin": pin
            }})
        })
        const body = await res.json();
        if(!res.ok){
            setMessage("Falsche Pin")
        }
        else{
            //redirect user to start page
            router.push("/start")
        }
    }

    return(
        <div className="flex flex-col w-full justify-center items-center h-[100vh]">
            <h1 className="text-xl my-4">Email-Adresse bestätigen</h1>
            <form onSubmit={handleSubmit} className="flex flex-col w-2/3 px-4 py-4 border-2 rounded-xl border-gray-300">
                <p className="text-center text-red-400 font-bold pb-1">{message}</p>
                <input type="number" name="emailPin" id="emailPin" className="border-2 rounded-xl px-2 py-1 border-gray-300" required/>
                <input type="submit" value="Email bestätigen" className="mt-4 bg-yellow-400 px-2 py-1 rounded-xl hover:opacity-80"/>
            </form>
        </div>
    )
}
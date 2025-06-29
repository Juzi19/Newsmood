"use client"

import { useState } from "react";
import { getCookie } from "../../../../../lib/frontend";
import Link from "next/link";

export default function AddSearch(){
    const [message, setMessage] = useState("")
    async function handleSubmit(e:any){
        e.preventDefault();

        const data = new FormData(e.currentTarget);
        const name = data.get("name")
        const csrfToken = getCookie("csrfToken", document);
        const res = await fetch("/api/auth/searches", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken!,
            },
            body: JSON.stringify({ data: {
                "name": name
            } }),
        })
        const body = await res.json();
        setMessage(body.message??'Fehler bei der Erstellung einer Suche')
        
        const input = document.getElementById('name') as HTMLInputElement | null;
        if (input) {
        input.value = ''; // empty input
        }

    }
    return(
        <div className="flex w-full min-h-[90dvh] justify-center items-center flex-col">
            <form onSubmit={handleSubmit}  className="flex justify-center items-center flex-col p-4 border-2 border-gray-300 rounded-xl w-2/3">
                <p className="text-green-400 font-bold text-center">{message}</p>
                <label htmlFor="name" className="mb-2">Name der Suche:</label>
                <input type="text" name="name" id="name" className="border-2 rounded-xl px-2 py-1 border-gray-300"/>
                <input type="submit" value="Erstellen" className="bg-amber-400 mt-2 p-2 rounded-xl hover:opacity-80"/>
            </form>
            <Link href='/searches' className="bg-black text-gray-50 mt-2 p-2 rounded-xl hover:opacity-80 font-bold">alle Suchbegriffe</Link>

        </div>
    )
}
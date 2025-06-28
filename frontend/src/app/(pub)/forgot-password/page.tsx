"use client"

import { useState} from "react";
import { getCookie } from "../../../../lib/frontend";
import { Sansita } from "next/font/google";

const sansita = Sansita({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-geist-mono'
})

export default function ForgotPassword(){

    const [message, setMessage] = useState("");


    async function handleSubmit(e:any){
        //prevent sending the form
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = formData.get("email");

        const csrfToken = getCookie("csrfToken", document);
        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken!,
            },
            body: JSON.stringify({
                "email": email
            } ),
          });
        if (!res.ok){
            setMessage("Serverfehler");
        }
        if(res.ok){
            setMessage("Wir haben ein neues Passwort zu einem Account mit der Email geschickt");
            form.reset()
        }
        
    }


    return(
    <div className="w-full flex h-[100vh] items-center justify-center flex-col">
        <h1 className="text-2xl">Passwort vergessen</h1>
        <h2 className={`${sansita.className}`}>newsmood</h2>

        <form onSubmit={handleSubmit} className="flex flex-col w-2/3 border-gray-200 border-2 rounded-xl p-4 mt-7">
            <p className="text-amber-400 font-bold text-center">{message}</p>
            <label htmlFor="email">Email:</label>
            <input type="email" name="email" id="email" className="border-2 border-gray-300 px-1"/>
            <input type="submit" value="Neues Passwort anfordern" className="mt-4 bg-yellow-400 px-2 py-1 rounded-xl hover:opacity-80"/>
        </form>
    </div>
    )
}
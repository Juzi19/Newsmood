"use client"

import { Sansita } from "next/font/google"
import { useState } from "react"
import { getCookie } from "../../../../lib/frontend"
import { useRouter } from "next/navigation"

const sansita = Sansita({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-geist-mono'
})

export default function SignUp(){
    const [message, setMessage] = useState("")
    const router = useRouter();

    async  function handleSubmit(e:any){
        //prevent sending the form
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username");
        const password = formData.get("password");
        const email = formData.get("email");


        const csrfToken = getCookie("csrfToken", document);
        const res = await fetch("api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken!,
            },
            body: JSON.stringify({"data": {
                "email": email,
                "password": password,
                "username": username
            }})
        });
        const body = await res.json();
        if (!res.ok){
            setMessage(body.message);
        }
        else{
            //redirect user
            router.push("/confirm-email");
        }
    }
    return (
        <div className="w-full flex justify-center items-center flex-col h-[100dvh]">
            <h1 className="text-2xl">Neues Konto</h1>
            <h2 className={`${sansita.className}`}>newsmood</h2>

            <form onSubmit={handleSubmit} className="flex flex-col w-2/3 my-7">
                <p className="text-center text-red-400 font-bold pb-1">{message}</p>
                <label htmlFor="username">Benutzername: </label>
                <input type="text" name="username" id="username" className="border-2 rounded-xl px-2 py-1 border-gray-300" required/>
                <label htmlFor="email">Email: </label>
                <input type="email" name="email" id="email" className="border-2 rounded-xl px-2 py-1 border-gray-300" required/>
                <label htmlFor="password">Passwort: </label>
                <input type="password" name="password" id="password" className="border-2 rounded-xl px-2 py-1 border-gray-300" required/>
                <input type="submit" value="Konto erstellen" className="mt-4 bg-yellow-400 px-2 py-1 rounded-xl hover:opacity-80"/>
            </form>
        </div>
    )
}
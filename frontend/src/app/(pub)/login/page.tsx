"use client"

import { useState, useEffect } from "react";
import { getCookie } from "../../../../lib/frontend";
import Link from "next/link";
import { Sansita } from "next/font/google";
import { useRouter } from "next/navigation";

const sansita = Sansita({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-geist-mono'
})

export default function Login(){

    const [message, setMessage] = useState("");
    const router = useRouter();


    async function handleSubmit(e:any){
        //prevent sending the form
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        const csrfToken = getCookie("csrfToken", document);
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken!,
            },
            body: JSON.stringify({ data: {
                "email": email,
                "password": password
            } }),
          });
        const body = await res.json()
        if (!body.login){
            setMessage("Falsche Login Daten");
        }
        if(res.ok){
            router.push('/start');
        }
        
    }


    return(
    <div className="w-full flex h-[100vh] items-center justify-center flex-col">
        <h1 className="text-2xl">Anmelden</h1>
        <h2 className={`${sansita.className}`}>newsmood</h2>

        <form onSubmit={handleSubmit} className="flex flex-col w-2/3 border-gray-200 border-2 rounded-xl p-4 mt-7">
            <p className="text-red-400 font-bold text-center">{message}</p>
            <label htmlFor="email">Email:</label>
            <input type="email" name="email" id="email" className="border-2 border-gray-300 px-1"/>
            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password" className="border-2 border-gray-300 px-1"/>
            <p className="text-sm text-gray-500 text-center pt-2">Kein Account? <Link href='/signup' className="underline hover:opacity-80">Konto erstellen</Link></p>
            <p className="text-sm text-gray-500 text-center">Passwort vergessen? <Link href='/forgot-password' className="underline hover:opacity-80">Zurücksetzen</Link></p>
            <input type="submit" value="Login" className="mt-4 bg-yellow-400 px-2 py-1 rounded-xl hover:opacity-80"/>
        </form>
    </div>
    )
}
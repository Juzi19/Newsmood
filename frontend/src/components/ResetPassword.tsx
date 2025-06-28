"use client"


import { Sansita } from "next/font/google";
import React from 'react';
import { useSearchParams } from "next/navigation";

const sansita = Sansita({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-geist-mono'
});

import { useState } from "react";
import { getCookie } from '../../lib/frontend';

export default function ResetPassword(){
    const [message, setMessage] = useState("");
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    console.log(token);
    

    async function handleSubmit(e:any){
            //prevent sending the form
            e.preventDefault();
    
            const form = e.currentTarget;
            const formData = new FormData(form);
            const psw1 = formData.get("password");
            const psw2 = formData.get("password2");

            if(psw1!.toString().length<8){
                setMessage("Passwort ist zu kurz")
                return
            }

            
            if (psw1 != psw2){
                setMessage("Passwörter sind unterschiedlich")
                return
            }
    
            const csrfToken = getCookie("csrfToken", document);
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": csrfToken!,
                },
                body: JSON.stringify({
                    "token": token,
                    "password": psw1
                } ),
              });
            if (!res.ok){
                setMessage("Fehler - möglicherweise ist der Token ungültig");
            }
            if(res.ok){
                setMessage("Passwort erfolgreich geändert");
                form.reset()
            }
            
        }
    return(
        <div className="w-full flex h-[100vh] items-center justify-center flex-col">
            <h1 className="text-2xl">Passwort zurücksetzen</h1>
            <h2 className={`${sansita.className}`}>newsmood</h2>
            <form onSubmit={handleSubmit} className="flex flex-col w-2/3 border-gray-200 border-2 rounded-xl p-4 mt-7">
                <p className="text-amber-400 font-bold text-center">{message}</p>
                <label htmlFor="password">Neues Passwort:</label>
                <input type="password" name="password" id="password" className="border-2 border-gray-300 px-1" required/>
                <label htmlFor="password2">Passwort wiederholen:</label>
                <input type="password" name="password2" id="password2" className="border-2 border-gray-300 px-1" required/>
                <input type="submit" value="Neues Passwort anfordern" className="mt-4 bg-yellow-400 px-2 py-1 rounded-xl hover:opacity-80"/>
            </form>
        </div>
         
    )
}

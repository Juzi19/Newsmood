"use client"

import { Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { getCookie } from "../../lib/frontend"

const geistmono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-geist-mono'
})

export default function Logout (){
    const router = useRouter()
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const csrfToken = getCookie("csrfToken", document);
        if (!csrfToken) {
            window.alert("CSRF-Token fehlt!");
            return;
        }

        const res = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})  // falls Backend JSON erwartet
        });

    if (!res.ok) {
        window.alert("Fehler beim Logout");
    }
    else{
        router.push("/login")
    }
}
    return(
        <form onSubmit={handleSubmit} className="ml-auto">
            <input type="submit" value="Logout" className={`${geistmono.className} px-2 py-1 bg-amber-300 my-1 rounded-xl hover:opacity-80`}/>
        </form>
    )
}
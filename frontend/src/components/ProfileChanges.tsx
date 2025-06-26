"use client"

import { useState } from "react";
import { getCookie } from "../../lib/frontend";

export default function ProfileChanges(props: {
    username: string
    _id: string
}){
    const{username, _id} = props;
    const [message, setMessage] = useState("")

    // change Username
    async function handleUsernameSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const csrfToken = getCookie("csrfToken", document)
        const currentTarget = e.currentTarget;
        const form = new FormData(currentTarget);
        if(form.get("username") == username){
            setMessage("Das ist dein aktueller Benutzername");
            return
        }
        const res = await fetch('api/auth/changeUsername', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken!,
            },
            body: JSON.stringify({
                "username": form.get("username"),
                "id": _id
            }),
        });
        if(res.ok){
            setMessage("Benutzername erfolgreich geändert")
            currentTarget.reset();
        }
        else{
            console.log(res)
            setMessage("Fehler beim Ändern des Benutzernamens!")
        }
    }

    // change Password
    async function handlePasswordSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const csrfToken = getCookie("csrfToken", document);
        const currentTarget = e.currentTarget;
        const form = new FormData(currentTarget);
        const psw = form.get("password") as string | null;
        if(psw!.length < 7){
            setMessage("Passwort zu kurz");
            return
        }
        if(form.get("password")!= form.get("password2")){
            console.log(form.get("password")!=form.get("password2"))
            setMessage("Beide Passwörter müssen gleich sein")
            return
        }
        const res = await fetch('api/auth/changePassword', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken!,
            },
            body: JSON.stringify({
                "password": form.get("password"),
                "id": _id
            }),
        });
        if(res.ok){
            setMessage("Passwort erfolgreich geändert")
            currentTarget.reset();
        }
        else{
            console.log(res)
            setMessage("Fehler beim Ändern des Passworts")
        }
    }

    return(
        <div>
            <p className="my-1 text-amber-400 font-bold">{message}</p>
            <h2 className="font-bold my-1">Benutzername ändern:</h2>
            <form onSubmit={handleUsernameSubmit} className="flex flex-col items-center">
                <label htmlFor="username" className="my-1">Neuer Benutzername:</label>
                <input type="text" name="username" id="username" className="w-full border-2 border-gray-400 my-1 px-1" required/>
                <input type="submit" value="Bestätigen" className="py-1 px-2 my-1 bg-black font-bold text-white hover:opacity-80 rounded-xl" />
            </form>
            <h2 className="font-bold my-1">Passwort ändern:</h2>
            <form onSubmit={(handlePasswordSubmit)} className="flex flex-col items-center">
                <label htmlFor="password" className="my-1">Neues Passwort:</label>
                <input type="password" name="password" id="password" className="w-full border-2 border-gray-400 my-1 px-1" required/>
                <label htmlFor="password2" className="my-1">Passwort wiederholen:</label>
                <input type="password" name="password2" id="password2" className="w-full border-2 border-gray-400 my-1 px-1" required/>
                <input type="submit" value="Bestätigen" className="py-1 px-2 bg-black font-bold text-white hover:opacity-80 rounded-xl my-1" />
            </form>
        </div>
    )
}
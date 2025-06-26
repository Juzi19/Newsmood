"use client"

import { useEffect, useState } from "react";
import { getCookie } from "../../../../../lib/frontend";
import LoadingAnimation from "@/components/LoadingAnimation";
import ResultsDisplay from "@/components/ResultsDisplay";
import { SentimentObject } from "@/components/ResultsDisplay";


export function FetchData({searchName}:{searchName: string}){

    const [message, setMessage] = useState('');
    const [animationIsVisible, setAnimationVisible] = useState(false)
    const [apiResponse, setApiReponse] = useState<SentimentObject[]>([
        {
            date: "",
            title: "",
            description: "",
            description_sentiment: 0.5,
            title_sentiment: 0.5,
        }
    ]);
    const [apiReponseVisible, setApiResponseVisible] = useState(false)

    // load max Age after hydrating
    useEffect(()=>{
        // max age for input field
        const input = document.getElementById("date") as HTMLInputElement;

        // Heutiges Datum holen
        const today = new Date();

        // 14 Tage abziehen (in Millisekunden)
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Formatieren als YYYY-MM-DD
        const formatted = fourteenDaysAgo.toISOString().split("T")[0];
        const formattedtoday = today.toISOString().split("T")[0];


        // Setzen als max-Wert
        input.min = formatted;
        input.max = formattedtoday;
    }, [])
    

    // event handler for Form submit
    async function handleSubmit(e:any) {
        e.preventDefault();
        setAnimationVisible(true)      
        const form = new FormData(e.currentTarget)
        const date = form.get("date")!;
        //checks if date is from the last 2 weeks (double-checking)
        const today = new Date();
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        const formatted = fourteenDaysAgo.toISOString().split("T")[0];
        const formattedtoday = today.toISOString().split("T")[0];
        if(formatted > date || date > formattedtoday){
            setMessage("Bitte ein Datum innerhalb der letzten 2 Wochen angeben")
            return
        }

        // continue preparing to fetch API
        const csrfToken = getCookie("csrfToken")
        console.log("Starting to fetch data")
        //fetch API to request data
        const res = await fetch('/api/auth/searches/fetch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken!
            },
            body: JSON.stringify({
                name: searchName,
                date: date
            })
        })
        const body = await res.json()
        if(res.ok){
            console.log(body)
            setApiReponse(body.sentiment)
            setApiResponseVisible(true)
        }
        else{
            console.error("Error when trying to fetch API")
        }
        setAnimationVisible(false);
    }

    /* Can be used to update the DOM too */
    const [decisionScore, setDecisionScore] = useState(0.5);

    function handleChange(e:React.ChangeEvent<HTMLInputElement>){
        setDecisionScore(Number(e.target.value));
    }
    return(
        <>
            <form onSubmit={handleSubmit} className="flex flex-col mt-2">
                <p className="font-bold text-red-400">{message}</p>

                <small className="text-center mb-1 text-gray-400">seit dem:</small>
                <input type="date" name="date" id="date" className="bg-blue-300 rounded-xl p-2" required/>
                {/* Decision calibrated scores */}
                <div className="bg-gray-400 mt-2 px-2 py-1 rounded-xl">
                    <p className="mt-1 text-center">Entscheidungsgrenze:</p>
                    <abbr title={`Entscheidungsgrenze`}>
                        <input 
                        type="range" 
                        name="decisionScores" 
                        id="decisionScores" 
                        max={1} 
                        min={0} 
                        step={0.01} // Optional: Feinere Schritte
                        value={decisionScore}
                        onChange={handleChange} 
                        className="mt-1"
                    /> 
                    </abbr>
                    <div className="w-full flex flex-row mb-1">
                    <small>Negativer</small>
                    <small className="ml-auto">Positiver</small>
                    </div>
                </div>              
                               
                <input type="submit" value="Start🔍" className="p-2 mt-2 bg-amber-400 rounded-xl hover:opacity-80 cursor-pointer" />
            </form>  
            <LoadingAnimation visible={animationIsVisible}></LoadingAnimation>
            <ResultsDisplay title={searchName} entries={apiResponse} visible={apiReponseVisible} decisionScore={decisionScore} setVisible={(setApiResponseVisible)}></ResultsDisplay>
        </>
             
    )
}
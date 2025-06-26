import { NextRequest, NextResponse } from "next/server";
import { SentimentObject } from "@/components/ResultsDisplay";
import { getCsrfToken } from "../../../../../../../lib/frontend";
import { checkCsrfToken, isloggedIn } from "../../../../../../../lib/auth";
import { api } from "../../../../../../../lib/auth";

export async function POST(req:NextRequest) {
    const body = await req.json();
    const { sentimentObjectArr, name }: { sentimentObjectArr: SentimentObject[] , name:string} = body;
    if(!sentimentObjectArr){
        return new NextResponse("Sentiment Object data required", {status: 400})
    }
    // auth user and check csrfToken
    if (await isloggedIn()){
        const res = await fetch(`${api}/xlsx`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        sentiment_data: sentimentObjectArr
                    })
                });
        return new NextResponse(res.body, {status: 200})
    }
    else{
        return new NextResponse("Access Denied - bad auth credentials", {status: 401})
    }
}
import { NextRequest, NextResponse } from "next/server";
import { api, checkCsrfToken, isloggedIn } from "../../../../../../lib/auth";
import { getCsrfToken } from "../../../../../../lib/frontend";

export async function POST(req:NextRequest) {
    const body = await req.json();
    const {name, date} = body;
    console.log(name, date)
    //check if name and date are provided
    if (!name || !date) {
        return new Response("Name and date are required", { status: 400 });
    }
    //check if name is a string
    if (typeof name !== "string") {
        return new Response("Name must be a string", { status: 400 });
    }
    //check if date is a string
    if (typeof date !== "string") {
        return new Response("Date must be a string", { status: 400 });
    } 
    //check if date is a valid date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return new Response("Date must be a valid date", { status: 400 });
    }
    //check if date is in the past
    const today = new Date();
    if (dateObj > today) {
        return new Response("Date must be in the past", { status: 400 });
    }
    //check if date is older than 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 15);
    if (dateObj < twoWeeksAgo) {
        return new Response("Date must not be older than 14 days", { status: 418 });
    }

    // read csrf token from request headers
    const csrfToken = getCsrfToken(req)!;

    // check if csrf token is valid
    if (await checkCsrfToken(csrfToken) && await isloggedIn()){
        // fetch API Endpoint
        const res = await fetch(`${api}/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                date: date
            })
        });
        if(res.ok){
            const {body} = res;
            console.log(body);
            return new NextResponse(body, { status: 200 });
        }
        else {
            return new NextResponse("Error when trying to fetch the latest news", {status: 500});
        }

    }
    else {
        return new NextResponse('CSRF Token invalid or user is not logged in', {status: 403});
    }
}
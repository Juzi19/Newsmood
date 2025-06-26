import { NextRequest } from "next/server";

// function to access cookie from the frontend
export function getCookie(cookieName: string, doc: Document = document): string | undefined {
    const cookies = doc.cookie.split("; ");
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === cookieName) {
        return decodeURIComponent(value);
      }
    }
    return undefined;
  }

export function getCsrfToken(req:NextRequest){
  try{
    const csrfToken = req.headers.get('x-csrf-token');

    if (!csrfToken) {
      throw new Error('CSRF Token fehlt!');
    }

    return csrfToken;
    

  }
  catch(error){
    console.log("CSRF Token missing or any other error")
    return null
  }
}
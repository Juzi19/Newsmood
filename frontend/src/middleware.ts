import { NextRequest, NextResponse } from "next/server";
import { checkCsrfToken, decideSession, isloggedIn } from "../lib/auth";
import { host } from "../lib/auth";
import { getCsrfToken } from "../lib/frontend";


export async function middleware(req: NextRequest){    
    //decides whether to start or proceed on an existing session
    await decideSession();

    const { pathname } = req.nextUrl;
    //auth middleware for protected parts of the page
    if(pathname.startsWith('/settings')|| pathname.startsWith('/start')||pathname.startsWith('/searches')||pathname.startsWith('/confirm-email')||pathname.startsWith('/model')){
        //using authMiddleware ontop, to check if user is authenticated
        if(! await authMiddleware()){
            //return user to th login page is it is not authentified
            return NextResponse.redirect(host + '/login/')
        }
    }

    // centralized approach to check CSRF Tokens
    if(req.method!='GET'){
        const csrfToken = getCsrfToken(req);
        if(!csrfToken){
            return new NextResponse("CSRF Token missing", {status: 403})
        }
        // return a new NextReponse if csrf Token is invalid
        else if(!(await checkCsrfToken(csrfToken))){
            console.warn("CSRF failed for", req.url, req.method);
            return new NextResponse("Wrong CSRF Token", {status: 403})
        }
    }

    const response = NextResponse.next();

    //securityheaders
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
        "Content-Security-Policy",
        `
        default-src 'self';
        script-src 'self' trusted-scripts.example.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        connect-src 'self' api.example.com;
        `.replace(/\s{2,}/g, " ") // removes unnecessary chars
    );

    //handles request normally
    return NextResponse.next();
}

async function authMiddleware() {
    if(await isloggedIn()){
        return true
    }
    else{
        return false
    }
}



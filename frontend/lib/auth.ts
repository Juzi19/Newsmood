import redis from "./redis"
import {cookies} from "next/headers"

export const host = process.env.HOST;
export const api = process.env.API;


// set validity for tokens and keys
const validity = 2 * 60 * 60 * 1000 // (ms)
const csrf_validity =  1 * 60 * 60 * 1000 // (ms)


// redis works with key - value, thus session information is the key for session_id
interface Session_Information {
    session_valid: Date,
    user_id: null | string,
    csrf_token: string,
    csrf_valid: Date
}



//starting a new session
export async function startSession(){
    // generate a unqiue session id
    const  session_id = generateSessionID();

    // create session information for the new session
    const session_information:Session_Information = {
        session_valid: new Date(Date.now() + validity),
        // will change as soon as the user logs in
        user_id: null,
        csrf_token: generateSessionID(),
        // csrf token valid for 1 hour from now
        csrf_valid: new Date(Date.now() + csrf_validity)
    }

    // load the user cookies
    const user_cookies = await cookies();
    // set expiracy date for new cookies
    let expires = session_information.session_valid;

    // save session as a user cookie
    user_cookies.set("session", session_id, {expires, httpOnly:true, sameSite:"strict", secure:true})

    //set csrf token cookie
    expires = session_information.csrf_valid
    user_cookies.set("csrfToken", session_information.csrf_token, {expires,httpOnly: false, sameSite:'strict', secure:true })

    await redis.set(session_id, session_information, {ex: validity/1000})
}

// extend an older session
export async function extendSession(old_session_id:string, session_information:Session_Information):Promise<string> {
    //renew session validity
    session_information.session_valid = new Date(Date.now() + validity)
    // delete the old session from redis
    await redis.del(old_session_id)
    // create a new session id and save it to redis
    const session_id = generateSessionID();

    // save the new session to redis
    await redis.set(session_id, session_information, {ex: validity/1000})

    return session_id
}


// decides about starting and extending sessions
export async function decideSession() {
    // request cookies from the user
    const user_cookies = await cookies();
    // get session id from the cokies -> else: null
    const session_id = user_cookies.get("session")?.value??null;

    //check session_id state
    if (session_id === null){
        // start a new session if there's no one running
        await startSession()
    }
    else{
        //check the existing session for expiry
        const session_information:Session_Information | null = await redis.get(session_id);
        if(session_information === null){
            console.log('Error connecting to redis')
        }
        else{
            //checks for session validy, renews it if necessary (new session 20 min before end)
            if(new Date(session_information.session_valid).getTime() <= Date.now() +  20*60*1000){
                console.log("EXTEND SESSION")
                //extending the current session
                const new_session_id:string = await extendSession(session_id, session_information)
                user_cookies.delete('session');
                user_cookies.set('session', new_session_id, {expires:new Date(session_information.session_valid),httpOnly:true, sameSite:'strict', secure: false})
            }
            //create a new csrfToken if it has a short validy
            if (new Date(session_information.csrf_valid).getTime() < Date.now() + 15*60*1000){
                console.log("CREATE CSRF TOKEN")
                session_information.csrf_token = generateSessionID();
                session_information.csrf_valid = new Date(Date.now() + csrf_validity);
                const expires = session_information.csrf_valid
                user_cookies.delete("csrfToken");
                user_cookies.set("csrfToken", session_information.csrf_token, {expires,httpOnly: false, sameSite:'strict', secure:true });

                //save to redis
                await redis.set(session_id, session_information, {ex: validity/1000})
            }

        }
        
    }

}

//validate csrf tokens from input form
export async function checkCsrfToken(csrfToken:string):Promise<boolean> {
    const user_cookies = await cookies();
    const session_id = user_cookies.get('session')?.value??null;
    const user_cookie_csrfToken = user_cookies.get('csrfToken')?.value??null
    if(session_id!=null){
        //request csrf Token
        const session_information:Session_Information | null= await redis.get(session_id);
        //checks if token is valid
        if(session_information === null){
            console.log("Error when connecting to redis")
            return false
        }
        else{
            //checks if theres a token
            if(new Date(session_information.csrf_valid).getTime() > Date.now() && user_cookie_csrfToken!=null){
                const state = session_information.csrf_token == csrfToken && csrfToken == user_cookie_csrfToken
                //decides to extend csrfToken
                if (new Date(session_information.csrf_valid).getTime() < Date.now() + 15*60*1000){
                    console.log("EXTEND CSRF TOKEN")
                    session_information.csrf_token = generateSessionID();
                    session_information.csrf_valid = new Date(Date.now() + csrf_validity);
                    const expires = session_information.csrf_valid
                    user_cookies.delete("csrfToken");
                    user_cookies.set("csrfToken", session_information.csrf_token, {expires,httpOnly: false, sameSite:'strict', secure:true })

                    //save to redis
                    await redis.set(session_id, session_information, {ex: validity/1000})
                }
                return state
            }
            else{
                //create a new new csrfToken and deny request
                console.log("NEW CSRF TOKEN")
                const newToken = generateSessionID();
                session_information.csrf_token = newToken;
                session_information.csrf_valid = new Date(Date.now() + csrf_validity);
                const expires = session_information.csrf_valid
                user_cookies.delete("csrfToken");
                user_cookies.set("csrfToken", newToken, {expires,httpOnly: true, sameSite:'strict', secure:true })
                
                //save to redis
                await redis.set(session_id, session_information, {ex:validity/1000})
                
                return false
            }
        }
    }
    return false
}


//signin function -> logs the user in
export async function login(user_id:string) {
    const user_cookies = await cookies();
    const session_id = user_cookies.get('session')?.value??null;
    if(session_id!=null){
        const session_information: Session_Information | null = await redis.get(session_id);
        if (!session_information){
            console.log("Error connecting to redis");
        }
        else{
            //saving user id to the session id
            session_information.user_id = user_id;
            redis.set(session_id, session_information, {ex:validity/1000});
        }
    }
}

//checks if user is logged in
export async function isloggedIn() {
    const user_cookies = await cookies();
    const session_id = user_cookies.get('session')?.value??null;
    if(session_id!=null){
        const session_information: Session_Information | null = await redis.get(session_id);
        if (!session_information){
            console.log("Error connecting to redis");
        }
        else{
            //checks if user is logged in
            if(session_information.user_id!=null){
                return true
            }
            else{
                return false
            }
        }
    }
}

//User ID
export async function getUserID():Promise<null | string> {
    const user_cookies = await cookies();
    const session_id = user_cookies.get('session')?.value??null;
    if(session_id!=null){
        const session_information: Session_Information | null = await redis.get(session_id);
        if (!session_information){
            console.log("Error connecting to redis");
        }
        else{
            //checks if user is logged in
            if(session_information.user_id!=null){
                return session_information.user_id
            }
        }
    }
    return null
}

export async function logout() {
    const user_cookies = await cookies();
    const session_id = user_cookies.get('session')?.value??null;
    if(session_id!=null){
        const session_information: Session_Information | null = await redis.get(session_id);
        if (!session_information){
            console.error("Error connecting to redis");
        }
        else{
            //saving user id = null to the session id
            session_information.user_id = null;
            redis.set(session_id, session_information, {ex:validity/1000});
        }
    }
}



function generateSessionID(){
    return crypto.randomUUID();
}

  
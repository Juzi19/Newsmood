import { login } from "./auth";
import redis from "./redis";

export function generateSecureTempPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (num) => chars[num % chars.length]).join('');
}

export async function rateLimitingLogin(username:string){
  // create a new entry if username is unknown yet
  const loginAttempts = await redis.get(username)??"0";
  if(Number(loginAttempts)>8){
    return false
  }
  else if(!login){
    await redis.set(username, 1);
    //reset bucket after 60 secs
    await redis.expire(username, 8);
  }
  else{
    await redis.incr(username)
  }
  return true
}

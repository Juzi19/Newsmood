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
  else if(loginAttempts=="0"){
    // rate limiting for 30 secs
    await redis.set(username, 1, { ex: 30 });
  }
  else{
    await redis.incr(username)
  }
  return true
}

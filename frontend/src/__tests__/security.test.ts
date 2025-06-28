import { generateSecureTempPassword } from "../../lib/security";
import { rateLimitingLogin } from "../../lib/security";

describe('generateSecureTempPassword', () => {
  it('should generate a password of the correct length', () => {
    const length = 16;
    const password = generateSecureTempPassword(length);
    expect(password).toHaveLength(length);
  });

  it('should generate a password containing only allowed characters', () => {
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const password = generateSecureTempPassword(50);
    for (const char of password) {
      expect(allowedChars).toContain(char);
    }
  });

  it('should generate different passwords on subsequent calls', () => {
    const pw1 = generateSecureTempPassword(12);
    const pw2 = generateSecureTempPassword(12);
    // Die Wahrscheinlichkeit, dass 2 generierte Passwörter identisch sind, ist extrem gering
    expect(pw1).not.toBe(pw2);
  });

  it('should generate a password with default length 12 if no argument is passed', () => {
    const password = generateSecureTempPassword();
    expect(password).toHaveLength(12);
  });
});


describe('rateLimiter', ()=>{
  it("check if rate limiter denies request", async ()=>{
    const username = "Franz"
    let response = true
    for(let i = 0; i<10; i++){
      response = await rateLimitingLogin(username);
    }
    expect(response).toBe(false);
  })
  it("check if rate limiter works for a new username", async ()=>{
    const username="Max"
    const res = await rateLimitingLogin(username);
    expect(res).toBe(true);
  })
})

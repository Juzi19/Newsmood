import { MongoClient, ObjectId } from "mongodb";
import { Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { sendEmail } from "./nodemailer";
import sanitize from 'mongo-sanitize';



let uri = process.env.MONGO_DB_USER_CONNECTION_STRING;

if (!uri) {
  throw new Error("Please define MONGO_DB_USER_CONNECTION_STRING in your .env.local");
}


const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// For development: use a global variable to preserve value across module reloads
declare global {
  // Allow global variable extension in TypeScript
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export interface UserEntry {
  username: string,
  _id?: ObjectId,
  email: string,
  password: string,
  email_pin: number,
  email_confirmed: boolean,
  token?: string,
  tokenValid?: number,  //number in millisecs
  searches: string[]
}

export default clientPromise;

export async function resetPassword(token:string, mypassword: string){
  const client = await clientPromise;
  const db = client.db("UserDB");
  const usersCollection = db.collection<UserEntry>("users");
  const user = await usersCollection.findOne({ token:token });
  if(!user){
    return{
      success: false, error: "Token invalid"
    }
  }

  if(Date.now()>user.tokenValid!){
    return{
      success: false, error: "Token expired"
    }
  }
  const password = await hashPassword(mypassword)
  try{
    //Update password
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password },
        $unset: { token: "", tokenValid: "" } 
      },
      
    );
    // status changes
   if (result.modifiedCount === 1) {
      return {
        success: true,
        token: token,
      };
    } else {
      return {
        success: false,
        error: "Fehler beim Speichern in der DB"
      };
    }
  
  }
  catch (error){
    console.error("Error when creating a user account (MongoDB)", error)

    return {
      success: false,
      error: "Error creating a user account",
    };
  }
}

export async function createToken(_id:string){
  try{
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");
    const user = await usersCollection.findOne({ _id:new ObjectId(_id) });
    if (!user) {
          return { success: false, error: "User not found" };
        }

        // Token erzeugen
        const token = crypto.randomUUID();
        const tokenValid = Date.now() + 1000 * 60 * 60; // gültig für 1 Stunde

        // Update in MongoDB
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: { token, tokenValid } }
        );

    
  // status changes
   if (result.modifiedCount === 1) {
      return {
        success: true,
        token: token,
      };
    } else {
      return {
        success: false,
        error: "Token konnte nicht gespeichert werden"
      };
    }
  }
  catch (error){
    console.error("Error when creating a user account (MongoDB)", error)

    return {
      success: false,
      error: "Error creating a user account",
    };
  }
}


export async function createUser(userData:UserEntry) {
  try{
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");

    // return bad response if Email already exists
    if (await emailExists(usersCollection, userData.email)){
      return {
        success: false,
        error: "Email ungültig",
      };
    }

    const result = await usersCollection.insertOne(userData);

    //send Email to the user with confirmation code
    await sendEmail({to: userData.email, subject: "Email bestätigen | newsmood", text: `Bitte bestätige deine Email mit folgendem Code ${userData.email_pin}`})

    return {
      success: true,
      insertedId: result.insertedId
    };
  }
  catch (error){
    console.error("Error when creating a user account (MongoDB)", error)

    return {
      success: false,
      error: "Error creating a user account",
    };
  }
}

async function emailExists(usersCollection: Collection<UserEntry>, email: string): Promise<boolean> {
  const existingUser = await usersCollection.findOne({ email:email });
  return !!existingUser; // true, if email found
}

//logging in the user
export async function identificateUser(email: string, password:string) {
  try{
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser){
      //return information about identification status
      return{
        user: existingUser,
        identification: await verifyPassword(password, existingUser.password)
      }
    }
    else{
      return{
        user: null,
        identification: false
      }
    }
  }
  catch (error){
    console.error(error)
    
  }
  
  
}

export async function getUserData(id:string):Promise<UserEntry|null>{
  try{
    const _id = new ObjectId(id);
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");
    const selectedUser = await usersCollection.findOne({ _id });
    if (selectedUser){
      //return information about identification status
      return selectedUser;
    }
    else{
      return null;
    }
  }
  catch(error){
    console.log("Error when trying to fetch data from the DB");
    console.log(error);
    return null;
  }
}

export async function changeUsername(id: string, username: string) {
  try {
    const _id = new ObjectId(id);
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");

    const updateResult = await usersCollection.updateOne(
      { _id },
      { $set: { username: sanitize(username) } }
    );

    if (updateResult.matchedCount === 0) {
      console.log("User not found.");
      return { success: false, error: "User not found." };
    }

    if (updateResult.modifiedCount === 1) {
      return { success: true, message: "Username updated successfully." };
    } else {
      return { success: false, error: "Username could not be updated." };
    }
  } catch (error) {
    console.log("Error when trying to update username in the DB");
    console.log(error);
    return { success: false, error: "Database error." };
  }
}


export async function changePassword(id: string, password: string) {
  try {
    const _id = new ObjectId(id);
    const client = await clientPromise;
    const db = client.db("UserDB");
    const usersCollection = db.collection<UserEntry>("users");

    const updateResult = await usersCollection.updateOne(
      { _id },
      { $set: { password: await hashPassword(password) } }
    );

    if (updateResult.matchedCount === 0) {
      console.log("User not found.");
      return { success: false, error: "User not found." };
    }

    if (updateResult.modifiedCount === 1) {
      return { success: true, message: "password updated successfully." };
    } else {
      return { success: false, error: "password could not be updated." };
    }
  } catch (error) {
    console.log("Error when trying to update password in the DB");
    console.log(error);
    return { success: false, error: "Database error." };
  }
}

// get userid based in email
export async function getUserIDFromEmail(emailAddress:string):Promise<string|null>{
  //sanitizes email
  const email = sanitize(emailAddress.trim().toLowerCase());
  //fetch DB for email address
  const client = await clientPromise;
  const db = client.db("UserDB");
  const usersCollection = db.collection<UserEntry>("users");
  const selectedUser = await usersCollection.findOne({ email: email });
  if(selectedUser){
    return selectedUser._id.toString()
  }
  else{
    return null
  }

}

//password functions
export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 10; // salting
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

import mongoose, { ConnectOptions } from "mongoose";
import { characterSchema } from "../schema/characterSchema";

const databaseURL = process.env.DATABASE_URL

if(databaseURL){
  mongoose.connect(databaseURL, {} as ConnectOptions)

  let db = mongoose.connection;

  db.on('error', () =>{
    console.log("Error Occured.")
  })
}

export const Characters = mongoose.model("Characters", characterSchema)
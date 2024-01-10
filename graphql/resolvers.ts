import fs from "fs";
import { GraphQLError } from 'graphql';
import { ObjectId } from "mongodb";
import { Characters } from "../db/connection";
import { Hint } from "../model/Character";
import localCharacters from "../data.json"

const databaseURL = process.env.DATABASE_URL

export const resolvers = {
  Query: {
    characters: () => {
      try {
        if(databaseURL){
          return Characters.find().exec() 
        }else{
          return localCharacters
        }
        
      }
      catch (err) { return err }
    },
    characterById: async (root: any, id: string ) => {
      const charId = new ObjectId(id);
      try {
        if(databaseURL){
          return await Characters.findOne({_id: charId}).orFail()
        } else {
          return localCharacters.find(char => { char._id === id})
        }
        
      }
      catch(err) { console.log(err) }
    }
  },
  Mutation: {
    addCharacter: async (root: any, { character }: any) => {
      const newCharacter = databaseURL ? new Characters({ ...character }) : {...character};

      try{
        const existingChar = databaseURL ? await Characters.findOne({name: newCharacter.name}).exec() : localCharacters.find(char => char.name === newCharacter.name)
        if(existingChar){
          throw new GraphQLError("A Character with that name already exists", {
            extensions: {
              code: 400
            }
          })
        }
        if(newCharacter.hints.length<3 || !(newCharacter.hints.some((hint: Hint)=> hint.level === 'easy') && newCharacter.hints.some((hint: Hint)=> hint.level === 'medium') && newCharacter.hints.some((hint: Hint)=> hint.level === 'hard'))){
          throw new GraphQLError("Hints must include easy, medium, and, hard levels", {
            extensions: {
              code: 400
            }
          })
        }
        if(newCharacter.hints.length>3){
          throw new GraphQLError("Too many Hints, Maximum of 3.", {
            extensions: {
              code: 400
            }
          })
        }

        const char = databaseURL ? newCharacter.save() : newCharacter

        if(!databaseURL){
          newCharacter._id = new ObjectId()
          const updatedChars = localCharacters.push(newCharacter)
          fs.writeFile("../data.json", JSON.stringify(updatedChars), (err)=>{
            if(err) throw new GraphQLError("Error creating Character.", {
              extensions: {
                code: 400
              }
            })
          })
        }

        return {
          code: 200,
          success: true,
          message: "Character Added Successfully.",
          character: char
        }
      }
      catch(err: any){ 
        return {
          code: err.extensions.code,
          success: false,
          message: err.message
        }
       }
    }
  }
}
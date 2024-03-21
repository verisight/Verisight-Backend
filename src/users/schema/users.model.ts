import * as mongoose from "mongoose"
export const UserSchema = new mongoose.Schema(
  {
    provider :{
      type: String,
      required:true,
    },


    username: {
      type: String,
      required: true,
      unique: true,
      
      },
      
    

    email:{
        type: String,
        required: true,
        unique: true,
        

    },
    password: {
      type: String,
      required:function(){
        return this.provider === 'local';
      }
    },
    designation:{
        type:String
    },

    profilePicture:{
        type:String,
    },
     
},
  { timestamps: true }
)

export interface User extends mongoose.Document {
        _id: string;
        username: string;
        password: string;
         email: string;
        designation:string;
        profilePicture:string;
        provider:string;
        
        
       
}

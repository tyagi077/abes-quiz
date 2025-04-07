import mongoose  from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema({
    admission_id:String,
})

export const UserModel = mongoose.model('users',User);


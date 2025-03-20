import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

export const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true 
    },
    last_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    profile_image: {
        type: String,
        required: false
    },
    hashPassword: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.comparePassword = (password, hashPassword) => {
    return bcrypt.compareSync(password, hashPassword);
};
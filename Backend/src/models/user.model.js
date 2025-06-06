import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        index: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);
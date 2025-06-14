import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



const dbConnect = async () => {
    try {
        console.log("process.env.MONGODB_URI", process.env.MONGODB_URI);
        // return
        
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //    const connectionInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)
        console.log("mongoDB connect successfully");

        // console.log(connectionInstance);
        

        return connectionInstance;
    } catch (error) {
        console.error(error);
    }
}

export default dbConnect;
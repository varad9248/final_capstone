import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDB = async () => {
    try {
        const mongodbInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("Connected to mongodb");
    } catch (error) {
        console.log("Mongoose connecting error from db directory...!");
        console.log("Error : "+error);
    }
}

export {connectToDB};
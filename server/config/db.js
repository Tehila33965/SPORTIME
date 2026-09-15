import { connect } from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
    try {
        await connect(env.MONGO_URI);
        console.log('mongo connected successfully');
    } 
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
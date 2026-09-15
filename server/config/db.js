import { connect } from "mongoose";
import { env } from "./env.js";
import dns from "dns";  // זה מה שגרם לשרת להתחבר למסד הנתונים

dns.setServers(["8.8.8.8", "8.8.4.4"]);

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
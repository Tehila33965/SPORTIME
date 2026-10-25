import { connect } from "mongoose";
import { env } from "./env.js";
import dns from "dns";  // זה מה שגרם לשרת להתחבר למסד הנתונים

// dns.setServers(["8.8.8.8", "8.8.4.4"]);
//dns.setServers(["192.168.0.1"]);
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(','));
}

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
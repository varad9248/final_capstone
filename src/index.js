import { app } from "./app.js";
import dotenv from "dotenv";
import { connectToDB } from "./db/index.js";


dotenv.config({
    path : "./env"
})

connectToDB()
.then(() => {
    app.listen(process.env.PORT , () => {
        console.log("Server is running...!");
        
    })
})
.catch(() => {
    console.log('Error while connecting to the database! in src/index.js');
})


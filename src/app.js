import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
    
}));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRoutes from "./routes/user.routes.js"
import productRoutes from "./routes/product.routes.js"
import searchproductRoutes from "./routes/product.routes.js"
import reviewRoutes from "./routes/product.routes.js"
import feedbackRoutes from "./routes/product.routes.js"


// Routes Declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/searchproduct", searchproductRoutes);

export {app};
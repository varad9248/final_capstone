import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";


const addReview = AsyncHandler(async (req,res) =>{
    // get the id product
    const {productId}= req.params;
    // check if the product is accesed ?
    const product = Product.findById(productId);
    // access the review from the product
    // 
});

const getProductReview = AsyncHandler( async (req , res)=>{
    const {productId}= req.params;
    const product = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(productId),
            }
        },
        {
            $lookup: {
                from: "Review",
                localField: "reviews",
                foreignField: "_id",
                as: "reviews",
            }
        }
    ]) 
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            product[0].reviews,
            "Review fetched successfully"
        )
    )
}
);

export {
    getProductReviews,
}
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { Review } from "../models/Review.model.js";
import { Product } from "../models/Product.model.js";


const createReviews = AsyncHandler(async (req, res) => {
    try {
        const reviewsData = req.body.reviews; // Assuming reviews is an array of review objects

        // Validate if reviewsData is an array and not empty
        if (!Array.isArray(reviewsData) || reviewsData.length === 0) {
            throw new ApiError(400, "Reviews data is required and should be an array");
        }

        // Array to store created reviews
        const createdReviews = [];

        // Iterate through each review data and create review entry
        for (const reviewData of reviewsData) {
            const { review_author, review_title, review_desc, review_rating, review_sentiment } = reviewData;

            // Validate required fields
            if ([review_author, review_title, review_desc, review_rating, review_sentiment].some(field => field?.trim() === "")) {
                throw new ApiError(400, "All fields are required for each review");
            }

            // Create review entry
            const review = await Review.create({
                review_author,
                review_title,
                review_desc,
                review_rating,
                review_sentiment
            });

            await Product.findByIdAndUpdate(
                req.params.productId,
                {
                    $addToSet : {
                        product_reviews : review._id
                    }
                },
                {new: true}
            );

            createdReviews.push(review);
        }


        // Send success response with created reviews
        return res.status(200)
                  .json(
                        new ApiResponse(
                            200, 
                            { reviews: createdReviews }, 
                            "Reviews created successfully"
                        )
                  );

    } catch (error) {
        console.error("Error creating reviews:", error);
        // Send error response
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
    }
});


const getProductReviews = AsyncHandler( async (req , res)=>{

    try {
        
        const product =  await Product.aggregate([
            {
                $match : {
                    _id : req.params.productId
                }
            },
            {
                $lookup : {
                    from: "reviwes",
                    localField: "product_reviews",
                    foreignField: "_id",
                    as: "product_reviews",
                }
            },
            {
                $project : {
                    _id : 1 ,
                    review_author : 1 ,
                    review_title : 1,
                    review_desc : 1 ,
                    review_rating : 1 ,
                    review_sentiment : 1
                }
            }
        ])
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            product,
            "reviews fetched successfully"
        ))
    } catch (error) {
        console.log("Error in getting product reviews");
    }

});


const deleteProductReviews = AsyncHandler( async (req , res)=>{

    try {
        const product = await Product.findById([
            {
                $match : {
                    "_id" : req.params.productId
                }
            },
            {
                $set : {
                    "product_reviews" : []
                }
            }
        ]);
    
        if(!product){
            return new ApiError(400, "product not found..!");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "review deleted Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In deleting the review');
    }

});

export {
    createReviews,
    getProductReviews,
    deleteProductReviews
}
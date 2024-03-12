import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { Product } from "../models/Product.model.js";
import { SearchProduct } from "../models/SearchProduct.model.js";


const createProducts = AsyncHandler(async (req,res) =>{
    try {
        const productsData = req.body.products; // Assuming reviews is an array of review objects

        // Validate if reviewsData is an array and not empty
        if (!Array.isArray(productsData) || reviewsData.length === 0) {
            throw new ApiError(400, "product data is required and should be an array");
        }

        // Array to store created reviews
        const createdProducts = [];

        // Iterate through each review data and create review entry
        for (const productData of productsData) {
            const { 
                url,
                averagePrice,
                category,
                currency,
                currentPrice,
                description,
                discountRate,
                highestPrice,
                image,
                isOutOfStock,
                lowestPrice,
                originalPrice,
                priceHistory,
                reviewsCount,
                title,
                users,
                domain,
                stars,
                product_reviews } = productData;

            // Validate required fields
            if ([ url,
                averagePrice,
                category,
                currency,
                currentPrice,
                description,
                discountRate,
                highestPrice,
                image,
                isOutOfStock,
                lowestPrice,
                originalPrice,
                priceHistory,
                reviewsCount,
                title,
                users,
                domain,
                stars,
                product_reviews
            ].some(field => field?.trim() === "")) {
                throw new ApiError(400, "All fields are required for each review");
            }

            // Create review entry
            const product = await Product.create({
                url,
                averagePrice,
                category,
                currency,
                currentPrice,
                description,
                discountRate,
                highestPrice,
                image,
                isOutOfStock,
                lowestPrice,
                originalPrice,
                priceHistory,
                reviewsCount,
                title,
                users,
                domain,
                stars
            });

            await SearchProduct.findByIdAndUpdate(
                req.params.searchId,
                {
                    $addToSet : {
                        scrapedProducts : product._id
                    }
                },
                {new: true}
            );

            createdProducts.push(product);
        }


        // Send success response with created products
        return res.status(200)
                  .json(
                        new ApiResponse(
                            200, 
                            { reviews: createdProducts }, 
                            "Products created successfully"
                        )
                  );
    } catch (error) {
        console.log(error);
    }
});

const getProduct = AsyncHandler( async (req , res)=>{
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
            }
        ])
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            product,
            "products fetched successfully"
        ))
    } catch (error) {
        console.log(error);
    }
});


const updateProduct = AsyncHandler( async (req , res)=>{
    try {
            const { 
                url,
                averagePrice,
                category,
                currency,
                currentPrice,
                description,
                discountRate,
                highestPrice,
                image,
                isOutOfStock,
                lowestPrice,
                originalPrice,
                priceHistory,
                reviewsCount,
                title,
                users,
                domain,
                stars,
                product_reviews } = productData;

            // Validate required fields
            if ([ url,
                averagePrice,
                category,
                currency,
                currentPrice,
                description,
                discountRate,
                highestPrice,
                image,
                isOutOfStock,
                lowestPrice,
                originalPrice,
                priceHistory,
                reviewsCount,
                title,
                users,
                domain,
                stars,
                product_reviews
            ].some(field => field?.trim() === "")) {
                throw new ApiError(400, "All fields are required for each review");
            }

            // Create review entry
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.productId, 
                {
                    $set: {
                        url,
                        averagePrice,
                        category,
                        currency,
                        currentPrice,
                        description,
                        discountRate,
                        highestPrice,
                        image,
                        isOutOfStock,
                        lowestPrice,
                        originalPrice,
                        priceHistory,
                        reviewsCount,
                        title,
                        users,
                        domain,
                        stars
                    }
                },
                {new: true}
            );

        // Send success response with updated products
        return res.status(200)
                  .json(
                        new ApiResponse(
                            200, 
                            { reviews: updatedProduct }, 
                            "Products created successfully"
                        )
                  );
    } catch (error) {
        console.log(error);
    }
});


export {
    createProducts,
    getProduct,
    updateProduct
}
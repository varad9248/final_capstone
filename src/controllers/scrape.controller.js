import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { scrapeAmazonPage } from "../lib/scraper/amazon/pageamazon.js";
import { scrapeFlipkartPage } from "../lib/scraper/flipkart/pageflipkart.js";
import { SearchProduct } from "../models/SearchProduct.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/Product.model.js";


const scrapeProducts = AsyncHandler(async (req,res) =>{

    try {

        const { productName } = req.body;
        console.log(productName);
        let suucess = false;

        if( !productName ) return new ApiError("400" , "Product name is not defined..!");


        const newSearch = await SearchProduct.create({
            prompt : productName , 
            productCount : 3 , 
            searchResult : suucess
        })

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet : {
                    searchHistory:newSearch._id
                }
            }
        )

        const  amazon_products  = await scrapeAmazonPage(productName , newSearch._id);
        const  flipkart_products  = await scrapeFlipkartPage(productName , newSearch._id);


        if(amazon_products || flipkart_products) {
            suucess = true
        }

        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "products scraped Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }

});


const getCategioryProducts = AsyncHandler( async (req , res)=>{

    try {

        const { categiory } = req.body;
        
        if( ! categiory) return new ApiError("400" , "Categiory is not defined");

        const categioryProducts = await Product.aggregate([
            {
                $match : {
                    category : categiory
                }
            },
            {
                $project : {
                    _id : 1,
                    title : 1,
                    category : 1,
                    currentPrice : 1,
                    image : 1
                }
            }
        ]) 
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    categioryProducts
                },
                "products accessed successfully Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }


});

const trackproduct = AsyncHandler( async (req , res)=>{

    try {
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "product added to tracking Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }

});

export {
    scrapeProducts,
    getCategioryProducts,
    trackproduct
}
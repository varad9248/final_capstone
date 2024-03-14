import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { scrapeAmazonPage } from "../lib/scraper/amazon/pageamazon.js";
import { scrapeFlipkartPage } from "../lib/scraper/flipkart/pageflipkart.js";
import { SearchProduct } from "../models/SearchProduct.model.js";
import { User } from "../models/user.model.js";


const scrapeAmazon = AsyncHandler(async (req,res) =>{

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

        console.log(amazon_products);

        if(amazon_products) {
            suucess = true
        }

        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    newSearch
                },
                "Amazon scraped Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }

});

const scrapeFlipkart = AsyncHandler( async (req , res)=>{

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

        const  amazon_products  = await scrapeFlipkartPage(productName , newSearch._id);

        console.log(amazon_products);

        if(amazon_products) {
            suucess = true
        }

        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    newSearch
                },
                "Amazon scraped Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }

});

const getCategioryProducts = AsyncHandler( async (req , res)=>{

    try {
        
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    feedback
                },
                "feedback updated Successfully"
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
                "feedback deleted Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }

});

export {
    scrapeAmazon,
    scrapeFlipkart,
    getCategioryProducts,
    trackproduct
}
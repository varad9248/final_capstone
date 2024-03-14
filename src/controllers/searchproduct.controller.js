import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { SearchProduct } from "../models/SearchProduct.model.js";
import { User } from "../models/user.model.js";

const createSearchHistory = AsyncHandler( async (req , res)=>{

    try {

        const  userId  = req.user._id;

        const { prompt , scrapedProducts , productCount , searchResult }  = req.body ;

        if ([prompt , scrapedProducts , productCount , searchResult].some(field => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required for each search");
        }

        const  history = await SearchProduct.create({
            prompt , 
            productCount , 
            searchResult
        });

        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    searchHistory : history._id
                }
            },
            {new : true}
        );

        scrapedProducts.some(async (product) => { 
            await SearchProduct.findByIdAndUpdate(
                history._id , 
                {
                    $addToSet : {
                        scrapedProducts: product._id
                    }
                }
            )
        })
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                history,
                "Search saved Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In saving the search');
    }

});

const getSearchHistoryById = AsyncHandler( async (req , res)=>{

    const searchId = req.params.searchId;

    const  searchHistory = await SearchProduct.aggregate([
        {
            $match : {
                _id : searchId
            }
        },
        {
            $lookup:{
                from:"products",
                localField:"scrapedProducts",
                foreignField:"_id",
                as:"scrapedProducts"
            }
        }
    ]);

    if(!searchHistory){
        return new ApiError("400" , "search not found");
    }

    try {
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                searchHistory,
                "Search fetched Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In geting the search');
    }

});

const deleteSearchHistory = AsyncHandler( async (req , res)=>{

    try {

        const searchHistory = await SearchProduct.findByIdAndDelete(req.params.searchId);

        if( !searchHistory ){
            return new ApiError("400" , 'No search history found with this id')
        };
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "Search deleted Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In deleting the search');
    }

});


const addproduct = AsyncHandler( async (req , res)=>{

    try {

        const productId = req.params.productId;
        const searchId = req.params.searchId;

        const searchHistory = await SearchProduct.findByIdAndUpdate(
            searchId,
            {
                $addToSet: {
                    scrapedProducts : productId
                }
            },
            {new: true}
        );
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                searchHistory,
                "product added to search Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In adding product to the search');
    }

});


const removeProduct = AsyncHandler( async (req , res)=>{

    try {

        const productId = req.params.productId;
        const searchId = req.params.searchId;

        const searchHistory = await SearchProduct.findByIdAndUpdate(
            searchId,
            {
                $pop : productId
            }
        );
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                searchHistory , 
                "product removed from Search Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In removing product from search');
    }

});


const getUserSearchHistory = AsyncHandler( async (req , res)=>{

    try {

        const userId = req.params.userId;

        const userSearchHistory = await User.aggregate([
            {
                $match : {
                    _id: userId
                }
            },
            {
                $lookup : {
                    from:"searchproducts",
                    localField:"searchHistory",
                    foreignField:"_id",
                    as:"searchHistory",
                    pipeline : [
                        {
                            $lookup : {
                                from : 'products',
                                localField : "scrapedProducts",
                                foreignField : "_id",
                                as : "scrapedProducts"
                            }
                        }
                    ]
                }
            }
        ]);

        if(!userSearchHistory){
            return new ApiError("400" , "userSearchHistory not found")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                userSearchHistory,
                "User Search History fetched Successfully"
            )
        )
    } catch (error) {
       console.log ('Error In accessing the user search history');
    }

});


export {
    getUserSearchHistory,
    removeProduct,
    addproduct,
    deleteSearchHistory,
    getSearchHistoryById,
    createSearchHistory
}
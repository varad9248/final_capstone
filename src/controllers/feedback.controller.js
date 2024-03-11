import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Feedback } from "../models/Feedback.model.js";


const createfeedback = AsyncHandler(async (req,res) =>{

    try {
        const {feedback_author,feedback_title,feedback_desc } = req.body

    
        if (
            [feedback_author , feedback_title , feedback_desc ].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }
    
        const feedback = await Feedback.create({
            "feedback_author":feedback_author,
            "feedback_title":feedback_title,
            "feedback_desc":feedback_desc,
            "feedback_email": req.user.email
        })
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    feedback
                },
                "feedback created Successfully"
            )
        )
    } catch (error) {
        console.log(error);
    }

});

const getUserFeedbacks = AsyncHandler( async (req , res)=>{

    const feedbacks = await Feedback.aggregate([
        { 
            $match: {
                "feedback_email": req.user.email
            }
        },
        {
            $project:{
                _id : 1,
                feedback_author : 1,
                feedback_title : 1,
                feedback_desc : 1,
                feedback_email : 1
            }

        }
    ]);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        feedbacks,
        "feedback fetched successfully"
    ))

});

const updateFeedback = AsyncHandler( async (req , res)=>{

    const {feedback_author,feedback_title,feedback_desc } = req.body;

    if (
        [feedback_author , feedback_title , feedback_desc ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const feedback = await Feedback.findByIdAndUpdate(
        req.params.feedbackId,
        {
            $set:{
                "feedback_author":feedback_author,
                "feedback_title":feedback_title,
                "feedback_desc":feedback_desc,
                "feedback_email": req.user.email
            }
        },
        {new: true}
    )

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


});

const deleteFeedback = AsyncHandler( async (req , res)=>{

    const feedback = await Feedback.findByIdAndDelete(req.params.feedbackId);

    if(!feedback){
        throw new ApiError(400, "feedback not found..!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "feedback deleted Successfully"
        )
    )

});

export {
    createfeedback,
    getUserFeedbacks,
    updateFeedback,
    deleteFeedback
}
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Feedback } from "../models/Feedback.model.js";


const createfeedback = AsyncHandler(async (req,res) =>{

    const {feedback_author,feedback_title,feedback_desc } = req.body;

    if (
        [feedback_author , feedback_title , feedback_desc ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedfeedback = await Feedback.findOne({
        $or : [ {feedback_author} , {feedback_title} , {feedback_desc} ]
    })

    if (existedfeedback) {
        throw new ApiError(409, "feedback already exists")
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

});

const getUserFeedback = AsyncHandler( async (req , res)=>{

    const feedbacks = await Feedback.find(req.user.username);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        feedbacks,
        "User fetched successfully"
    ))

});

const updateFeedback = AsyncHandler( async (req , res)=>{

});

const deleteFeedback = AsyncHandler( async (req , res)=>{

});

export {
    createfeedback,
    getUserFeedback,
    updateFeedback,
    deleteFeedback
}
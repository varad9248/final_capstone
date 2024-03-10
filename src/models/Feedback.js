import mongoose, {Schema} from "mongoose";

const feedbackSchema = new Schema(
    {
        feedback_author :{
            type: String,
            required : true
        },
        feedback_title:{
            type:String,
            required : true,
        },
        feedback_desc : {
            type :String,
            required : true,
        },
        feedback_email : {
            type:String,
            required : true
        }
    },
    {
        timestamps: true // Saves created
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
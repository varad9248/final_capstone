import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const reviewSchema = new Schema(
    {
        review_author :{
            type: String,
            required : true
        },
        review_rating : {
            type: Number,
            required : true, 
            min:1, max:5
        },
        review_title:{
            type:String,
            required : true,
        },
        review_desc : {
            type :String,
            required : true,
        },
        review_sentiment : {
            type : String,
            required : true,
            default : "positive"
        }
    },
    {
        timestamps: true // Saves created
    }
);

reviewSchema.plugin(mongooseAggregatePaginate);

export const Review = mongoose.model("Review", reviewSchema);
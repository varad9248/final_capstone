import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const productSchema = new Schema(
    {
        url: {
            type: String,
            required: true
        },
        averagePrice: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        currentPrice: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required : true,
        },
        discountRate: {
            type: Number,
            required: true
        },
        highestPrice: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        isOutOfStock: {
            type: Boolean,
            required: true
        },
        lowestPrice: {
            type: Number,
            required: true
        },
        originalPrice: {
            type: Number,
            required: true
        },
        priceHistory: [
            {
                type: Number,
                required : false
            }
        ],
        reviewsCount: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        users : [ 
            {
                type : [Schema.Types.ObjectId],
                required: true,
                ref : "User"
            } 
        ],
        domain : {
            type : String ,
            required : true
        },
        satrs :{
            type : Number,
            required : false,
            default : 4.0
        },
        reviews :[ 
            {
                type : Schema.Types.ObjectId ,
                required : false ,
                ref   : 'Review'
            }
        ]    
    },
    {
        timestamps: true // Saves created
    }
);

productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", productSchema)
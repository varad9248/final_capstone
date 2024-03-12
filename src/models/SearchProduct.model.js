import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const searchproductSchema = new Schema(
    {
        prompt : {
            type : String,
            required : true,
        },
        scrapedProducts :[ 
            {
                type : Schema.Types.ObjectId,
                ref : "Product"
            }
        ],
        productCount : {
            type : Number,
            required : true,
        },
        searchResult : {
            type : Boolean,
            required : true
        }
    },
    {
        timestamps: true // Saves created
    }
);

searchproductSchema.plugin(mongooseAggregatePaginate);

export const SearchProduct = mongoose.model("searchproduct", searchproductSchema);
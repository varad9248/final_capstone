import mongoose, {Schema} from "mongoose";

const searchproductSchema = new Schema(
    {
        prompt : {
            type : String,
            required : true,
        },
        products : {
            type : Schema.Types.ObjectId,
            ref : "Product"
        },
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

export const SearchProduct = mongoose.model("SearchProduct", searchproductSchema);
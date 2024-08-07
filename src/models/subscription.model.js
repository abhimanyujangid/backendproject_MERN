import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema =  new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //one who subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //one to  whom subscribe is subscribing
        ref:"User"
    }
})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)
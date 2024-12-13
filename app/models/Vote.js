const { Schema, default: mongoose, models, model } = require("mongoose");

const voteSchema = new Schema({
    userEmail: {type:String , required: true},
    feedbackId: {type: mongoose.Types.ObjectId , required: true},
    upploads: {type: [String]},
} , {
    timestamps:true,
});

export const Vote = models?.Vote || model('Vote' , voteSchema);
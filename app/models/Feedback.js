import {model, models, Schema} from "mongoose";
import './User'; 

const feedbackSchema = new Schema({
    title: {type: String , required: true} , 
    description: {type: String } , 
    uploads: {type: [String]},
    userEmail: {type: String, required: true},
    votesCountCached: {type: Number, default: 0},
} , {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
});

feedbackSchema.virtual('user', {
    ref: 'User',
    localField: 'userEmail',
    foreignField: 'email',
    justOne: true,
});


export const Feedback = models?.Feedback || model('Feedback' , feedbackSchema);
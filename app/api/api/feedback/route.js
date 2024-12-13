import { Feedback } from "@/app/models/Feedback";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Comment } from "@/app/models/Comment";

// MongoDB connection utility
const mongoUrl = process.env.MONGO_URL;
let isConnected = false; // Track the connection status

async function connectToDatabase() {
    if (isConnected) return; // If already connected, skip
    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw new Error("Database connection failed.");
    }
}

// API Handlers
export async function POST(request) {
    try {
        await connectToDatabase(); // Ensure DB connection
        const jsonBody = await request.json();
        const { title, description, uploads } = jsonBody;

        // Create a new feedback entry
        const session = await getServerSession(authOptions);
        const userEmail = session.user.email;
        const feedbackDoc = await Feedback.create({ title, description, uploads,userEmail });
        return new Response(JSON.stringify(feedbackDoc), { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/api/feedback:", error);
        return new Response(JSON.stringify({ error: "Failed to create feedback" }), { status: 500 });
    }
}

export async function PUT(request) {
    const jsonBody = await request.json();
    const {title, description, uploads, id} = jsonBody;
    const mongoUrl = process.env.MONGO_URL;
    mongoose.connect(mongoUrl);
    const session = await getServerSession(authOptions);
    if(!session) {
        return Response.json(false);
    }
    const newFeedbackDoc = await Feedback.updateOne(
        {_id:id, userEmail:session.user.email},
        {title, description, uploads},
    );
    return Response.json(newFeedbackDoc);
}

export async function GET(req) {
    try {
        await connectToDatabase();
        const url = new URL(req.url);
        const feedbacks = await Feedback.find().populate('user');
        if(url.searchParams.get('id')) {
            return Response.json(
                await Feedback.findById(url.searchParams.get('id'))
            );
        } else {
            const sortParam = url.searchParams.get('sort');
            const loadedRows = url.searchParams.get('loadedRows');
            const searchPhrase = url.searchParams.get('search');
            let sortDef;
            if(sortParam === 'latest') {
                sortDef = {createdAt: -1};
            }
            if(sortParam === 'oldest') {
                sortDef = {createdAt: 1};
            }
            if(sortParam === 'votes') {
                sortDef = {votesCountCached: -1};
            }

            let filter = null;
            if(searchPhrase) {
                const comments = await Comment.find({text:{$regex: '.*'+searchPhrase+'.*'}}, 'feedbackId', {limit:10});
                filter = {
                    $or:[
                        {title: {$regex: '.*'+searchPhrase+'.*'}},
                        {description: {$regex: '.*'+searchPhrase+'.*'}},
                        {_id: comments.map(c => c.feedbackId)}
                    ]
                }
            }

            return Response.json(await Feedback.find(filter, null, {
                sort : sortDef,
                skip:loadedRows,
                limit : 10,
            }).populate('user'));
        }

    } catch (error) {
        console.error("Error in GET /api/api/feedback:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch feedbacks" }), { status: 500 });
    }
}

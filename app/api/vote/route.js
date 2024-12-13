import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Vote } from "../../models/Vote";
import { Feedback } from "@/app/models/Feedback";

export async function GET(request) {
    const url = new URL(request.url);
    if(url.searchParams.get('feedbackIds')) {
        const feedbackIds = url.searchParams.get('feedbackIds').split(',');
        const votesDocs = await Vote.find({feedbackId: feedbackIds});
        return Response.json(votesDocs);
    }
    return Response.json([]);
}

async function recountVotes(feedbackId) {
    const count = await Vote.countDocuments({feedbackId});
    await Feedback.updateOne({_id:feedbackId}, {
        votesCountCached: count,
    });
}

export async function POST(request) {
    try {
        // Ensure a valid MongoDB connection
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        // Parse the request body
        const jsonBody = await request.json();
        const { feedbackId } = jsonBody;

        // Validate feedbackId
        if (!feedbackId) {
            return new Response(JSON.stringify({ error: "Feedback ID is required" }), { status: 400 });
        }

        // Get the user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const userEmail = session.user.email;

        // Check if a vote already exists
        const existingVote = await Vote.findOne({ feedbackId, userEmail });
        if (existingVote) {
            await Vote.findByIdAndDelete(existingVote._id);
            await recountVotes(feedbackId);
            return new Response(JSON.stringify({ message: "Vote removed", existingVote }), { status: 200 });
        } else {
            // Create a new vote
            const voteDoc = await Vote.create({ feedbackId, userEmail });
            await recountVotes(feedbackId);
            return new Response(JSON.stringify(voteDoc), { status: 201 });
        }
    } catch (error) {
        console.error("Error processing vote:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
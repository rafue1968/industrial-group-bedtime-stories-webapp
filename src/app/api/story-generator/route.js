import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../../lib/firebaseAdmin";
import admin from "firebase-admin";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Critical Error: GEMINI_API_KEY is not set in environment variables.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default async function POST(req){
    if (!genAI) {
            return NextResponse.json(
                { error: "Server configuration error: Gemini API key missing." },
                { status: 500 }
            );
        }


    try {
        const { topic, userId } = req.json();

        if (!topic || typeof topic !== 'string' || topic.trim() === '') {
            return NextResponse.json(
                { error: "A topic is required to generate a story." },
                { status: 400 }
            );
        }
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is missing. Cannot save summary without user association." },
                { status: 400 }
            );
        }


        const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});
        const prompt = `Generate a imaginative bedtime story about the topic: ${topic}. Make it suitable for adults`;

        const result = model.generateContent(prompt);
        const response = await result.response;

        const aiGeneratedText = response.text();

        const docRef = await db.collection("users").doc(userId).collection("stories").add({
            topic: topic,
            story: aiGeneratedText,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            message: "Story generated and saved!",
            id: docRef.id,
            story: aiGeneratedText,
        }, {status: 200});



    } catch (err) {
        console.error("Failed to generate or save summary:", err);
        return NextResponse.json(
            { error: "Failed to generate or save summary. Please try again later." },
            { status: 500 }
        );
    }
}
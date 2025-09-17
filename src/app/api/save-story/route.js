"use server";

import { NextResponse } from "next/server";
import { admin } from "../../../../lib/firebaseAdmin";

export async function POST(req) {
    const { story, userId, topic } = await req.json();

    if (!story || !userId) {
        return NextResponse.json({
            status: 400,
            error: "Missing required fields",
        })
    }

    try {
        const docRef = admin.firestore().collection(`users/${userId}/savedStories`).doc();
        const storyId = docRef.id;

        await docRef.set({
            storyId,
            story,
            storyName: topic,
            topic: topic || "General",
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        return NextResponse.json({
            status: 200,
            message: "Story saved successfully!",
        })
    } catch (err) {
        return NextResponse.json({
            status: 500,
            error: err.message
        })
    }
}
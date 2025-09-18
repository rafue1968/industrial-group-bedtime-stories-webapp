# Sleeping AI
A web application for AI-generated bedtime stories designed to help adults relax and improve their sleep quality.

## Overview
Sleeping AI is a group project developed for the Industrial Consulting Project module at Solent University Southampton .  
The web app is aimed at adults and focuses on improving wellbeing and sleep quality through calming, AI-driven bedtime stories with integrated audio playback features.  

Users can:  
- Sign up or log in securely using Firebase Authentication  
- Generate story summaries and expand them into full stories (5, 10, or 20 minutes)  
- Use the built-in Text-to-Speech (TTS) system with customisable voice, pitch, speed, and background audio  
- Save and replay stories in a personal library  
- Share stories with the community, browse others’ stories, and like them  

## Features
- Secure authentication (Email/Password + Google Sign-In)  
- AI-powered text generation using Google’s Generative AI (Gemini API)  
- Story summaries and extended full story generation  
- Customisable Text-to-Speech playback options (voice, pitch, speed, background sounds)  
- Personal library to save and manage stories  
- Community page with story discovery, likes, and genre filters  
- Responsive, calming UI designed to be accessible and user friendly  

## Tech Stack
- **Frontend:** Next.js (React + App Router)  
- **Backend:** Firebase Cloud Firestore + Firebase Auth + Next.js API routes  
- **AI Integration:** Google Generative AI (Gemini API) for text generation  
- **Styling:** Tailwind CSS and custom components  
- **Design:** Figma used for wireframes and user interface design concepts  

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)  
- npm (comes with Node)  
- Firebase project with API key and Firestore enabled  
- Gemini API key (Google Generative AI)  

### Installation Guide

To run the project locally:

1. Clone the repository  
   ```bash
   git clone https://github.com/rafue1968/industrial-group-bedtime-stories-webapp.git
   cd industrial-group-bedtime-stories-webapp

2. Install dependencies
npm install

3. Create a .env.local file in the root folder and add your Firebase and Gemini API keys:
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id


4. Start the development server
npm run dev


5. Open your browser and go to:
http://localhost:3000

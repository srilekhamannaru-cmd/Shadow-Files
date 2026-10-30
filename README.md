
# 🕵️ SHADOW FILES – AI Investigation Room

## About the Project

SHADOW FILES is an AI-powered mystery investigation game where users take on the role of detectives and solve mysterious cases.

Players investigate cases by examining clues, questioning suspects, collecting evidence, and making a final accusation. The application uses Google's Gemini AI to generate unique mystery cases based on the selected difficulty level.

## Live Application

**Frontend:** https://shadow-files-one.vercel.app

**Backend:** https://shadow-files-backend.onrender.com

## Features

* AI-generated mystery cases.
* Multiple difficulty levels: Easy, Medium, and Hard.
* Different suspects with individual profiles.
* Interactive clue discovery.
* AI-powered hints.
* Case notes and evidence board.
* Final suspect accusation.
* Investigation results and scoring system.

## Technologies Used

**Frontend**

* React
* Vite
* JavaScript
* HTML and CSS

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB Atlas
* Mongoose

**AI Integration**

* Google Gemini API
* Google GenAI SDK

**Deployment**

* Vercel – Frontend
* Render – Backend

## Project Structure

```text
Shadow-Files/
│
├── client/          # React frontend
│
├── server/          # Node.js and Express backend
│
├── SPEC.md          # Project specifications
│
├── README.md        # Project documentation
│
├── .gitignore
│
└── package-lock.json
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/srilekhamannaru-cmd/Shadow-Files.git
```

```bash
cd Shadow-Files
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and add:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm start
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder and add:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## How the Application Works

1. The user opens SHADOW FILES and selects a mystery difficulty.
2. Gemini AI generates a mystery case with suspects and clues.
3. The user investigates suspects and discovers available evidence.
4. The user can request hints and record investigation notes.
5. After examining the evidence, the user makes a final accusation.
6. The application displays the investigation result and score.

## Developer

**Sri Lekha Mannaru**

GitHub: https://github.com/srilekhamannaru-cmd

---

This project was developed as part of the AI Automation Platform Workshop.

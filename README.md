# 🕵️ SHADOW FILES – AI Investigation Room

SHADOW FILES is an AI-powered mystery investigation application where users become detectives and solve mysterious cases by examining clues, investigating suspects, and analyzing evidence.

The application uses Google's Gemini AI to generate unique mystery cases based on the selected difficulty level. Players can discover clues, request hints, maintain case notes, make accusations, and uncover the truth through an interactive investigation experience.

## 🌐 Live Application

**Live Website:** https://shadow-files.vercel.app

**Backend API:** https://shadow-files-backend.onrender.com

## 📂 GitHub Repository

https://github.com/srilekhamannaru-cmd/Shadow-Files

## ✨ Features

* **AI-Generated Mysteries:** Generate unique investigation cases using Gemini AI.
* **Multiple Difficulty Levels:** Choose between Easy, Medium, and Hard.
* **Suspect Investigation:** Examine different suspects and investigate their possible involvement.
* **Clue Discovery:** Discover and analyze evidence throughout the investigation.
* **Hint System:** Request hints when you need help solving a case.
* **Case Notes:** Record important observations and investigation details.
* **Evidence Board:** Organize and review collected evidence.
* **Accusation System:** Accuse the suspect you believe is responsible.
* **Results and Scoring:** View the final investigation result and receive a score based on your performance.

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Artificial Intelligence

* Google Gemini API
* Google GenAI SDK

### Deployment

* Vercel – Frontend Hosting
* Render – Backend Hosting
* MongoDB Atlas – Cloud Database

## 📁 Project Structure

```text
shadow-files/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
├── server/
│   ├── models/
│   │   └── Case.js
│   ├── routes/
│   │   └── caseRoutes.js
│   ├── services/
│   │   └── mysteryGenerator.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── SPEC.md
├── package-lock.json
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run SHADOW FILES locally.

### 1. Clone the Repository

```bash
git clone https://github.com/srilekhamannaru-cmd/Shadow-Files.git
```

```bash
cd Shadow-Files
```

### 2. Backend Setup

Open a terminal inside the project folder.

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and add:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own credentials.

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal from the main project folder.

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local development URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 🔑 Environment Variables

The application requires the following environment variables:

| Variable       | Description                     |
| -------------- | ------------------------------- |
| MONGODB_URI    | MongoDB Atlas connection string |
| GEMINI_API_KEY | Google Gemini API key           |
| VITE_API_URL   | Backend API base URL            |

**Important:** Never upload `.env` files, API keys, or database credentials to GitHub.

## 🔄 Application Workflow

1. Open the SHADOW FILES application.
2. Enter the investigation room.
3. Select a mystery difficulty level.
4. Generate a mystery using Gemini AI.
5. Investigate suspects and examine available clues.
6. Discover evidence and request hints when required.
7. Record observations in case notes.
8. Make a final accusation.
9. View the investigation result and score.

## 🚀 Deployment

The application is deployed using separate hosting platforms:

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas
* **AI Integration:** Google Gemini API

The frontend communicates with the backend through REST API requests.

## 📄 Project Documentation

Refer to [SPEC.md](SPEC.md) for the detailed project specification, application workflow, API design, scoring system, and implementation requirements.

## 👩‍💻 Developer

**Sri Lekha Mannaru**

B.Tech Student | AI and Full Stack Development Enthusiast

---

**SHADOW FILES – Every clue matters. Every suspect has a story. Find the truth.**

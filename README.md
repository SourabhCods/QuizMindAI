# QuizMind AI

Hello Aryan! Welcome to your AI-powered quiz generator!

## What is This?

QuizMind AI creates custom quiz questions using **free local AI** (Ollama). No API keys needed. No cloud costs. Just you, your computer, and smart questions!

---

## What You Need

- **Node.js** (download from nodejs.org)
- **Ollama** (free AI engine - download from ollama.ai)
- **orca-mini model** (2GB, loads automatically)

---

## How to Start

### Step 1: Start Ollama (DO THIS FIRST!)
```bash
# Windows - Ollama usually runs in the background, OR manually:
"C:\Users\acer\AppData\Local\Programs\Ollama\ollama.exe" serve
```

### Step 2: Start the Backend Server
```bash
node server.js
```
Success: You should see: `📡 Using AI Provider: OLLAMA` and `Server is listening on port 3001`

### Step 3: Start the Frontend (in a NEW terminal)
```bash
npm run dev
```
Success: You should see: `VITE ready in XXX ms` and `Local: http://localhost:5173`

### Step 4: Open in Browser
Go to `http://localhost:5173` and start creating quizzes!

---

## How to Use

1. **Login as Student**
2. Click **"Take Quiz"**
3. Select a **Subject** (Math, Science, History, etc.)
4. Pick a **Topic** (Algebra, Biology, etc.)
5. Choose **Difficulty** (Easy/Medium/Hard)
6. Select **Number of Questions** (1-10)
7. Click **"Generate Quiz with AI"**
8. Answer questions and see your score!

---

## Project Structure

```
quizmind-ai/
├── main.jsx                 # Entry point
├── server.js               # Backend (Express) - talks to Ollama
├── vite.config.js          # Frontend build settings
│
├── model/
│   ├── apiService.js       # AI quiz generation logic
│   ├── sessionStore.js     # Saves your session data
│   └── constants.js        # Settings & config
│
├── view/
│   ├── QuizView.jsx        # Quiz taking screen
│   ├── StudentHomeView.jsx # Home page
│   └── others...           # Other screens
│
├── presenter/
│   ├── QuizPresenter.jsx   # Controls quiz logic
│   └── others...           # Other controllers
│
└── styles/
    ├── global.css          # Main styling
    └── components.css      # Component styles (FONT SIZES INCREASED HERE!)
```

---

## How It Works (The Magic Inside)

When you ask for **5 Algebra questions**:

1. **Frontend** sends request to backend
2. **Backend** sends prompt to **Ollama AI** on port 11434
3. **Ollama** (orca-mini model) generates questions in this format:
   ```
   1. What is 5 + 7? (a) 10 (b) 12 (c) 15 (d) 18 Answer: b
   2. What is 15 - 8? (a) 5 (b) 6 (c) 7 (d) 8 Answer: c
   ...
   ```
4. **Backend** parses the questions
5. **Frontend** displays them beautifully
6. You answer, see results instantly

---

## Troubleshooting

### "Failed to connect to Ollama"
- Ollama not running? Start it first: `"C:\Users\acer\AppData\Local\Programs\Ollama\ollama.exe" serve`
- Still not working? Try: `curl http://localhost:11434/api/tags`

### "Only 2 questions generated (asked for 5)"
- Model is being stubborn
- The prompt in `apiService.js` has been fixed to be very explicit now
- If still broken, check server logs for "Parsed X questions"

### "Font sizes too small"
- Already fixed! Check `styles/components.css` - sizes increased 30-50%

### Slow to generate questions
- Ollama is thinking (orca-mini ~5-10 seconds)
- This is normal with local AI
- If taking >30 seconds, restart Ollama

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Beautiful UI |
| **Backend** | Express.js | API proxy |
| **AI Engine** | Ollama (orca-mini) | Question generation |
| **Styling** | CSS (Dark theme) | Industrial look |

---

## Features Included

- Customizable Quizzes - Pick subject, topic, difficulty
- Free AI - No API costs, everything local
- Instant Results - See score immediately
- AI Explanations - Model explains why answer is correct
- Dark Theme - Easy on the eyes
- Responsive Design - Works on desktop/tablet
- Student Analytics - Track your progress

---

## Known Issues

- Model sometimes ignores format (fixed in latest prompt)
- Occasional extra spaces in questions (parser handles it)
- No persistent login (demo mode only)
- Memory limited to 400 tokens (prevents system overload)

---

## Tips & Tricks

1. **Want harder questions?** Select "Hard" difficulty - prompt adjusts automatically
2. **AI being weird?** Restart Ollama - sometimes cache gets stale
3. **Want different model?** Change in `server.js` line 91 (search for "orca-mini")
4. **Customize prompt?** Edit `model/apiService.js` function `generateQuiz()`

---

## Quick Commands

```bash
# Start everything at once (if on Windows):
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; 
Start-Sleep -Seconds 2; 
node server.js &
npm run dev

# Check if Ollama is running:
curl http://localhost:11434/api/tags

# Stop all node processes:
Get-Process node | Stop-Process -Force

# Clear quiz cache:
# Edit→Delete localStorage in browser DevTools (F12)
```

---

## Future Improvements (Maybe?)

- Multi-language support
- User accounts & cloud sync
- Export quizzes to PDF
- Teacher dashboard
- Mobile app version
- Interactive question types (matching, fill-blank)

---

## Notes

> "This project killed many bugs so you don't have to!" - Said no one ever, but it's true.

> "Why local Ollama instead of API?" Because free > paid, and your data stays on YOUR machine.

> "Is orca-mini smart enough?" Yes! For school quizzes, it understands context pretty well.

---

## Made with love by Aryan

**Version:** 1.0  
**Last Updated:** March 14, 2026  
**Status:** Working & Getting Smarter Every Day

---

**Happy Learning!** Now go ace those quizzes!

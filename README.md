# GRE Drill Sergeant MVP

High-intensity GRE Reading Comprehension drill app with a "tough love" coaching approach.

## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- Lucide React (Icons)

**Backend:**
- Python (FastAPI)
- In-memory session storage (MVP)
- Mock LLM responses (ready to swap with OpenAI/Anthropic)

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## User Flow

1. **First Time Setup**: Select difficulty (Beginner/Intermediate/Advanced) + exam date
   - Configuration is saved to localStorage
   - Future sessions auto-start with saved settings
2. **Exam Screen**: Silent testing mode with passage + 3 questions (split view)
3. **Redemption Screen** (if mistakes): Fix mistakes with coach hints (spoiler-free)
4. **Summary Screen**: Victory lap with scores, traps identified, and coach message
   - Click "START NEW SESSION" to jump straight into another drill (no re-config needed)

## Key Features

- **Spoiler Firewall**: Hints never reveal correct answers, only attack wrong logic
- **Two Strikes Rule**: Get it wrong twice → see full explanation
- **Parallel LLM Calls**: Backend analyzes all mistakes simultaneously
- **Streak Tracking**: localStorage-based daily streak counter
- **Persistent Configuration**: One-time setup, then instant drills
- **Mobile-First Design**: Navy/blue education theme, clean UI

## API Endpoints

- `POST /generate-session` - Generate passage + questions
- `POST /analyze-mistakes` - Analyze wrong answers (parallel processing)
- `POST /session-summary` - Generate motivational summary

## Next Steps (Post-MVP)

- Swap mock LLM functions with real API calls (OpenAI/Anthropic)
- Add persistent database (PostgreSQL/MongoDB)
- Implement user accounts and authentication
- Add more question types (Vocabulary, Sentence Equivalence)
- Analytics dashboard for progress tracking

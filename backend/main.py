"""
FastAPI Backend for GRE Drill Sergeant MVP.
Handles session generation, mistake analysis, and summary generation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import drill, auth

# ============================================================================
# APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="GRE Drill Sergeant API",
    description="High-intensity GRE Reading Comprehension drill backend",
    version="1.0.0"
)

# CORS middleware (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# ROUTES
# ============================================================================

app.include_router(drill.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "alive", "service": "GRE Drill Sergeant API"}

# ============================================================================
# RUN SERVER (for local development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

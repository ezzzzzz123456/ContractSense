from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.mongo import connect_mongo, disconnect_mongo
from app.routes import analyse, party, health, chat
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_mongo()
    yield
    # Shutdown
    await disconnect_mongo()


app = FastAPI(
    title="ContractSense AI Backend",
    version="1.0.0",
    description="PDF parsing, LLM orchestration, and party intelligence for ContractSense.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(analyse.router, prefix="/api/ai", tags=["Analysis"])
app.include_router(party.router, prefix="/api/ai", tags=["Party Intelligence"])
app.include_router(chat.router, prefix="/api/ai", tags=["Chat"])

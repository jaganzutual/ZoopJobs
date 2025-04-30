from fastapi import APIRouter
from .user_routes import router as user_router
from .resume_routes import router as resume_router

# Create main router
router = APIRouter()

# Include all route modules
router.include_router(user_router)
router.include_router(resume_router) 
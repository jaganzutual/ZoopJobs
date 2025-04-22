from database import engine, SessionLocal
from models import Base, User
from schemas.user_schemas import OnboardingStatus

def init_db():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a default user
    db = SessionLocal()
    try:
        default_user = User(
            email="default@example.com",
            onboarding_status=OnboardingStatus.NOT_STARTED.value
        )
        db.add(default_user)
        db.commit()
        print(f"Created default user with ID: {default_user.id}")
    except Exception as e:
        print(f"Error creating default user: {str(e)}")
        db.rollback()
    finally:
        db.close()
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db() 
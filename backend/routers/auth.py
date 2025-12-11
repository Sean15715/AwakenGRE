from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from database import get_db
from models import User
from schemas import UserCreate, UserResponse, LoginRequest, Token, UserUpdate
from services.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if email already exists
    result = await db.execute(select(User).filter(User.email == user.email))
    db_user_email = result.scalars().first()
    if db_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    
    # 2. Check if username already exists
    result = await db.execute(select(User).filter(User.username == user.username))
    db_user_username = result.scalars().first()
    if db_user_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already taken"
        )

    # 3. Handle exam_date parsing
    parsed_exam_date = None
    if user.exam_date:
        try:
            # Try parsing ISO format (e.g. 2025-12-15T10:00:00)
            parsed_exam_date = datetime.fromisoformat(user.exam_date)
        except ValueError:
            try:
                # Fallback to simple date format (YYYY-MM-DD)
                parsed_exam_date = datetime.strptime(user.exam_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid exam_date format. Use ISO format or YYYY-MM-DD"
                )

    # 4. Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        streak_days=0,
        exam_date=parsed_exam_date
    )
    
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the user: {str(e)}"
        )
    
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Find user by username
    result = await db.execute(select(User).filter(User.username == form_data.username))
    user = result.scalars().first()

    # 2. Authenticate
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Create Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user_update.exam_date is not None:
        try:
             # Try parsing ISO format (e.g. 2025-12-15T10:00:00)
            parsed_exam_date = datetime.fromisoformat(user_update.exam_date)
        except ValueError:
            try:
                # Fallback to simple date format (YYYY-MM-DD)
                parsed_exam_date = datetime.strptime(user_update.exam_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid exam_date format. Use ISO format or YYYY-MM-DD"
                )
        current_user.exam_date = parsed_exam_date
    
    try:
        await db.commit()
        await db.refresh(current_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )
    
    return current_user

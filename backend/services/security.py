from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

# Configuration (In production, these should be in environment variables)
SECRET_KEY = "AWAKEN_GRE_SUPER_SECRET_KEY"  # Change this!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create a CryptContext object. This handles hashing and verification.
# We use "argon2" as the hashing scheme.
# "deprecated='auto'" allows it to verify older hashes if we change schemes later,
# but marks them as deprecated so they can be re-hashed.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Generates a hash for a plain password.
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# 这里的连接字符串对应 docker-compose.yml 中的配置
DATABASE_URL = "postgresql+asyncpg://gre_user:gre_password@localhost/gre_db"

# 创建异步引擎
engine = create_async_engine(DATABASE_URL, echo=True)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 声明式基类（所有的 ORM 模型都继承自它）
Base = declarative_base()

# 依赖注入函数：用于在 FastAPI 路由中获取数据库会话
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
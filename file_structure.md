Repo/
├── backend/
│   ├── alembic/                 # 数据库迁移脚本目录
│   │   ├── versions/            # 存放具体的迁移版本文件 (.py)
│   │   └── env.py               # Alembic 环境配置（连接 DB 与 Models）
│   ├── prompts/                 # LLM 提示词模板
│   │   ├── endgame.txt          # 总结阶段提示词
│   │   └── redemption.txt       # 错题订正提示词
│   ├── questions/               # 本地题库 (JSON)
│   │   ├── passage1.json
│   │   └── ...
│   ├── routers/
│   │   └── drill.py             # 路由层：处理 HTTP 请求
│   ├── services/
│   │   ├── llm_service.py       # LLM 服务：调用大模型生成内容
│   │   └── session_service.py   # 业务逻辑层：管理 Session 状态
│   ├── alembic.ini              # Alembic 配置文件
│   ├── database.py              # 数据库连接与 Session 管理
│   ├── main.py                  # 应用入口：App 初始化与路由挂载
│   ├── models.py                # SQLAlchemy 数据库模型 (ORM)
│   ├── schemas.py               # Pydantic 数据模型（严格 JSON 契约/DTO）
│   └── requirements.txt         # Python 依赖
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.jsx       # 首页（已配置用户）
│   │   │   ├── SetupScreen.jsx      # 初次配置界面
│   │   │   ├── ExamScreen.jsx       # 考试模式（静默答题）
│   │   │   ├── RedemptionScreen.jsx # 错题订正循环
│   │   │   ├── SummaryScreen.jsx    # 总结界面
│   │   │   └── SettingsScreen.jsx   # 设置/重置数据
│   │   ├── SessionContext.jsx       # 全局状态管理
│   │   ├── api.js                   # 后端 API 客户端
│   │   ├── App.jsx                  # 路由控制器
│   │   └── index.css                # 全局样式 + Tailwind
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml       # 本地数据库容器编排
├── README.md                # 英文文档
├── README_CN.md             # 中文技术文档
└── start.sh                 # 一键启动脚本
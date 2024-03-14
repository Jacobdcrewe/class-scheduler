@echo off

start cmd /k "pip install -r requirements.txt && cd .\backend && python -m uvicorn server:app --reload"
start cmd /k "cd .\frontend && npm install && npm run start"

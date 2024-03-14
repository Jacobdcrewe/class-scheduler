@echo off

start cmd /k "pip install -r requirements.txt && cd .\backend && uvicorn server:app --reload"
start cmd /k "cd .\frontend && npm install && npm run start"

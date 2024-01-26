@echo off

start cmd /k "cd .\backend && python -m uvicorn server:app --reload"
start cmd /k "cd .\frontend && npm run start"

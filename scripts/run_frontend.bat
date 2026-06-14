@echo off
cd /d "%~dp0..\frontend-react"
npm install
if not exist .env copy .env.example .env
npm run dev

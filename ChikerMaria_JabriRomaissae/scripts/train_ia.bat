@echo off
cd /d "%~dp0..\ia"
pip install -r requirements.txt
python train_model.py

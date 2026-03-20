#!/bin/bash
# Azure App Service startup script for the backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Azure Full-Stack Demo — React + FastAPI

A minimal, production-ready template for deploying a **Vite/React frontend** and **FastAPI/Uvicorn backend** to Azure.

```
azure-app/
├── frontend/          # Vite + React
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/           # FastAPI + Uvicorn
│   ├── main.py
│   ├── requirements.txt
│   └── startup.sh
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions CI/CD
└── .gitignore
```

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs available at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at http://localhost:5173  
(Vite proxies /api/* → http://localhost:8000 automatically)

---

## Azure Deployment

### Architecture
- **Frontend** → Azure Static Web Apps (free tier available)
- **Backend**  → Azure App Service (Python, B1 tier ~$13/mo)

### Prerequisites
- Azure subscription
- Azure CLI installed (`az login`)
- GitHub account (repo must be public or you need GitHub Actions enabled)

### Step 1 — Create Azure resources

```bash
# Variables — change these
RESOURCE_GROUP="rg-azuredemo"
LOCATION="westeurope"
BACKEND_APP="azuredemo-api-<yourname>"   # must be globally unique
PLAN="azuredemo-plan"

# Resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# App Service Plan (Linux, B1)
az appservice plan create \
  --name $PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Backend App Service (Python 3.11)
az webapp create \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN \
  --runtime "PYTHON:3.11"

# Set startup command
az webapp config set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --startup-file "startup.sh"

# Set environment variable
az webapp config appsettings set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings ENVIRONMENT=production \
    ALLOWED_ORIGINS=https://<your-static-web-app>.azurestaticapps.net
```

### Step 2 — Create Azure Static Web App

Do this via the Azure Portal:
1. Search for **Static Web Apps** → Create
2. Connect your GitHub repo
3. Set **App location** = `frontend`, **Output location** = `dist`
4. Azure generates a deploy token and adds it to your repo secrets automatically

Or via CLI:
```bash
az staticwebapp create \
  --name azuredemo-frontend \
  --resource-group $RESOURCE_GROUP \
  --source https://github.com/<you>/<repo> \
  --location "westeurope" \
  --branch main \
  --app-location "frontend" \
  --output-location "dist" \
  --login-with-github
```

### Step 3 — Add GitHub Secrets

In your GitHub repo → Settings → Secrets and variables → Actions, add:

| Secret name                        | Value                                      |
|------------------------------------|--------------------------------------------|
| `BACKEND_URL`                      | `https://<backend-app>.azurewebsites.net`  |
| `BACKEND_APP_NAME`                 | `<backend-app>` (just the name)            |
| `AZURE_WEBAPP_PUBLISH_PROFILE`     | Contents of the publish profile XML        |
| `AZURE_STATIC_WEB_APPS_API_TOKEN`  | Auto-added by Azure when linking repo      |

**Get the publish profile:**
```bash
az webapp deployment list-publishing-profiles \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --xml
```
Copy the entire XML output as the secret value.

### Step 4 — Push to main

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

GitHub Actions will:
1. Build the React app with `VITE_API_URL` pointing at your backend
2. Deploy the built `dist/` folder to Azure Static Web Apps
3. Deploy the `backend/` folder to Azure App Service

---

## Useful Commands

```bash
# Stream backend logs
az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP

# Restart backend
az webapp restart --name $BACKEND_APP --resource-group $RESOURCE_GROUP

# Check backend env settings
az webapp config appsettings list --name $BACKEND_APP --resource-group $RESOURCE_GROUP
```

## API Endpoints

| Method | Path           | Description                  |
|--------|----------------|------------------------------|
| GET    | /              | Root health check            |
| GET    | /api/health    | Detailed health + environment|
| GET    | /api/info      | Stack info                   |
| POST   | /api/message   | Reverse a string             |

Interactive docs: `https://<backend-app>.azurewebsites.net/docs`

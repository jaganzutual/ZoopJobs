# ZoopJobs FastAPI Server

Backend server for ZoopJobs, providing API endpoints for job automation and management.

## 🛠️ Technology Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Python 3.11+
- Docker

## 🚀 Getting Started

### Local Development

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   .\venv\Scripts\activate  # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload --port 8028
   ```

### Docker Development

```bash
docker build -t zoopjobs-fastapi-server .
docker run -p 8028:8028 zoopjobs-fastapi-server
```

## 📚 API Documentation

Once the server is running, access the API documentation at:
- Swagger UI: http://localhost:8028/docs
- ReDoc: http://localhost:8028/redoc

## ��️ Project Structure 
# ZoopJobs

An AI-powered job automation platform that helps users track and apply for jobs efficiently.

## Project Overview

ZoopJobs is an open-source platform that:
- Aggregates jobs from various company career pages
- Allows users to track their job applications
- Provides AI-powered assistance for job applications
- Supports multiple LLM providers (OpenAI, Together.ai, etc.)

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker

## Features

- User authentication and authorization
- Job application tracking
- AI-powered application assistance
- Customizable LLM integration
- Modern, responsive UI

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.11+ (for local backend development)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/zutual/zoopjobs.git
   cd zoopjobs
   ```

2. Copy the environment template:
   ```bash
   cp .env.template .env
   ```

3. Update the `.env` file with your configuration

4. Start the development environment:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Development without Docker

#### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend/react-app
   npm install
   ```

2. Run the frontend:
   ```bash
   npm start
   ```

## Project Structure

```
zoopjobs/
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   ├── tests/        # Backend tests
│   └── requirements.txt
├── frontend/         # React frontend
│   └── react-app/    # React application
├── docker-compose.yml
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FastAPI for the amazing backend framework
- React for the frontend framework
- All contributors and supporters of the project 
# Interview Task Project

## Overview
This is a full-stack web application developed as part of an interview task. It features a Django REST Framework backend with JWT authentication and a React frontend.

### 🔧 Stack
- **Backend**: Django REST Framework, SQLite, SimpleJWT
- **Frontend**: React, Bootstrap, Axios, React Router

### ✨ Features
- Admin dashboard to:
  - Create and delete users
  - Assign per-page permissions (view, edit, create, delete)
- User dashboard to:
  - View assigned permissions
- JWT authentication with CORS support

---

## 🙏 Situation and Apology

Apologies for the delay in pushing this to GitHub. I accidentally discarded all changes during development and had to recreate the entire project from scratch, which caused unexpected delays. Additionally, debugging URL routing and migrations, along with personal commitments, added to the timeline.

The application is now fully rebuilt, functional, and tested. Thank you for your patience — happy to clarify or improve anything further.

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git
- SQLite (default with Django)

---

### ⚙️ Backend Setup

```bash
git clone https://github.com/yourusername/interview_task.git
cd interview_task/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

### 💻 Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

---

## 📋 Usage

### Admin Dashboard
- **Login**: [http://localhost:5173/login](http://localhost:5173/login)
- **Manage users/permissions**: [http://localhost:5173/admin](http://localhost:5173/admin)

### User Dashboard
- **View permissions**: [http://localhost:5173/dashboard](http://localhost:5173/dashboard)

---

## 🔌 API Endpoints

| Method | Endpoint                                | Description                      |
|--------|------------------------------------------|----------------------------------|
| POST   | `/api/login/`                            | Authenticate, return JWT tokens |
| GET    | `/api/users/`                            | List all users (admin only)     |
| POST   | `/api/users/create/`                     | Create new user (admin only)    |
| PUT    | `/api/users/<user_id>/permissions/`      | Update user permissions         |
| DELETE | `/api/users/<user_id>/delete/`           | Delete a user                   |
| GET    | `/api/me/permissions/` *(optional)*      | Get current user's permissions  |

---

## 🗂 Project Structure

```
interview_task/
├── backend/
│   ├── api/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── urls.py
│   │   ├── views.py
│   ├── manage/
│   │   ├── settings.py
│   │   ├── urls.py
│   ├── manage.py
├── frontend/
│   ├── src/
│   │   ├── AdminDashboard.jsx
│   │   ├── UserDashboard.jsx
│   ├── package.json
├── README.md
├── .gitignore
```

---

## 📄 Notes

**`.gitignore` excludes:**

```
venv/
env/
*.pyc
__pycache__/
db.sqlite3
*.log
node_modules/
build/
dist/
*.env
*.env.local
*.env.development.local
*.env.test.local
*.env.production.local
```

- **Backend runs at**: [http://localhost:8000](http://localhost:8000)
- **Frontend runs at**: [http://localhost:5173](http://localhost:5173)

---

## 🚀 Production Considerations

- Set `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `settings.py`
- Use a production-ready database (e.g., PostgreSQL)
- Store secrets in environment variables (`.env`) and keep them out of version control
- Consider deploying using Docker, Heroku, or another cloud service

---

## 📜 License

This is a demo project built for interview purposes and does not use a specific open-source license.

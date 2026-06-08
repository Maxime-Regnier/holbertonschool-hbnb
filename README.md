# 🏠 HBnB — AirBnB Clone

> A full-stack AirBnB-inspired web application built across 4 progressive parts: architecture design, REST API, authentication & database persistence, and a dynamic JavaScript frontend.

![Python](https://img.shields.io/badge/Language-Python%203.x-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Framework-Flask%203.x-000000?logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/Frontend-JavaScript%20ES6+-F7DF1E?logo=javascript&logoColor=black)
![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-red)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Holberton School](https://img.shields.io/badge/Holberton-School-red)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture — The 4 Parts](#-architecture--the-4-parts)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Installation & Usage](#-installation--usage)
- [API Endpoints](#-api-endpoints-v1)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Branch Strategy](#-branch-strategy)
- [Code Documentation](#-code-documentation)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🎯 Project Overview

**HBnB** is a full-stack clone of AirBnB, developed iteratively in 4 parts at Holberton School. It demonstrates:

- ✅ Software architecture design with UML diagrams
- ✅ RESTful API design with Flask-RESTX
- ✅ JWT-based authentication and role-based authorization
- ✅ ORM-based database persistence with SQLAlchemy
- ✅ A dynamic single-page frontend with vanilla JavaScript

---

## 🗺 Architecture — The 4 Parts

### Part 1 — Technical Documentation

Design phase: UML diagrams and technical specifications before any code was written.

| Artifact | Description |
|---|---|
| `ClassDiagram.png` | Full class diagram of all entities |
| `PackageDiagram.png` | Package/layer architecture overview |
| `SequenceDiagram UserRegistration.png` | Flow for user registration |
| `SequenceDiagram PlaceCreation.png` | Flow for creating a place |
| `SequenceDiagram FetchingListOfPlace.png` | Flow for fetching places |
| `SequenceDiagram Review Submission.png` | Flow for submitting a review |
| `Documentation HBnB.pdf` | Full written technical documentation |

### Part 2 — Business Logic & REST API (In-Memory)

A working REST API built with Flask-RESTX, using an **in-memory repository** (no database). Implements the Facade pattern for the service layer.

**Entities:** User, Place, Amenity, Review  
**Auth:** None (open endpoints)  
**Storage:** In-memory (Python dicts)

### Part 3 — Authentication, Authorization & Persistence

Extends Part 2 with:
- **JWT authentication** via `flask-jwt-extended`
- **Role-based access control** (admin vs. regular users)
- **SQLAlchemy ORM** replacing the in-memory repository
- **Full frontend** with HTML templates, CSS, and JavaScript (`main.js`)

### Part 4 — Dynamic Frontend

A standalone HTML/CSS/JavaScript frontend with:
- `index.html` — List of places with filtering
- `login.html` — JWT login form
- `place.html` — Place details and reviews
- `add_review.html` — Submit a review (authenticated users)

---

## 🛠 Technologies

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Core language |
| **Flask** | 3.x | Web framework |
| **Flask-RESTX** | 1.x | REST API + auto-generated Swagger docs |
| **Flask-JWT-Extended** | 4.x | JWT authentication |
| **SQLAlchemy** | 2.x | ORM and database persistence |
| **Bcrypt** | 4.x | Password hashing |
| **JavaScript** | ES6+ | Frontend logic |
| **HTML5 / CSS3** | — | Frontend markup and styling |

---

## ⚙️ Prerequisites

- **OS:** Linux (Ubuntu 22.04+), macOS, or Windows with WSL2
- **Python:** 3.10 or higher
- **pip:** Latest version

```bash
# Verify
python3 --version
pip --version
```

---

## 🚀 Installation & Usage

### Part 2 (API without auth)

```bash
# 1. Navigate to part2
cd part2/hbnb

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
python run.py
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/api/v1/
```

### Part 3 (API with JWT + frontend)

```bash
# 1. Navigate to part3
cd part3/hbnb

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
python run.py
# API + frontend at http://localhost:5000
```

### Part 4 (Standalone frontend)

Open `part 4/index.html` directly in a browser, or serve with a local HTTP server:

```bash
cd "part 4"
python3 -m http.server 8080
# Visit http://localhost:8080
```

---

## 📡 API Endpoints (v1)

**Base path:** `/api/v1`  
**Authentication:** Bearer JWT token required for protected routes (Part 3+)

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/users/` | Create a user | No |
| GET | `/users/` | List all users | No |
| GET | `/users/<id>` | Get user details | No |
| PUT | `/users/<id>` | Update user | Owner or Admin |

### Amenities

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/amenities/` | Create an amenity | Admin |
| GET | `/amenities/` | List amenities | No |
| GET | `/amenities/<id>` | Get amenity | No |
| PUT | `/amenities/<id>` | Update amenity | Admin |

### Places

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/places/` | Create a place | Authenticated |
| GET | `/places/` | List places | No |
| GET | `/places/<id>` | Get place with owner/amenities/reviews | No |
| PUT | `/places/<id>` | Update place | Owner or Admin |
| GET | `/places/<id>/reviews` | Get reviews for a place | No |

### Reviews

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/reviews/` | Submit a review | Authenticated |
| GET | `/reviews/` | List reviews | No |
| GET | `/reviews/<id>` | Get review | No |
| PUT | `/reviews/<id>` | Update review | Owner or Admin |
| DELETE | `/reviews/<id>` | Delete review | Owner or Admin |

### Authentication (Part 3+)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login and receive JWT token |

---

## 📂 Project Structure

```
holbertonschool-hbnb/
│
├── part1/                              # UML design & documentation
│   ├── ClassDiagram.png
│   ├── PackageDiagram.png
│   ├── SequenceDiagram *.png
│   └── Documentation HBnB.pdf
│
├── part2/hbnb/                         # REST API (no auth, in-memory)
│   ├── app/
│   │   ├── api/v1/                     # Endpoints (users, places, reviews, amenities)
│   │   ├── models/                     # Business entities with validation
│   │   ├── services/facade.py          # Service layer (Facade pattern)
│   │   └── persistence/repository.py  # In-memory storage
│   ├── tests/
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
│
├── part3/hbnb/                         # API + auth + frontend
│   ├── app/
│   │   ├── api/v1/                     # Endpoints + auth.py
│   │   ├── models/                     # Extended models with password hashing
│   │   ├── services/facade.py
│   │   ├── persistence/repository.py
│   │   ├── templates/                  # Jinja2 HTML templates
│   │   └── static/                     # CSS + JS (main.js) + images
│   ├── tests/
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
│
└── part 4/                             # Standalone HTML/JS frontend
    ├── index.html
    ├── login.html
    ├── place.html
    ├── add_review.html
    ├── review.html
    ├── styles.css
    └── images/
```

---

## ✨ Features

- **Facade pattern** — single service entry point decouples API layer from business logic
- **Layered architecture** — Presentation → Business Logic → Persistence
- **Input validation** — email format, password length, coordinate ranges, rating constraints
- **JWT authentication** — stateless auth with token expiry
- **Role-based access control** — admin users can bypass ownership checks
- **Password hashing** — bcrypt with salt
- **Swagger UI** — auto-generated API documentation via Flask-RESTX
- **Comprehensive tests** — 22KB test suite covering all API endpoints

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready code |
| `develop` | Active development |
| `testing` | Integration testing |

---

## 📚 Code Documentation

All Python functions and classes are documented following **PEP 257 docstring conventions**:

```python
class User(BaseModel):
    """
    Represents a registered user of the HBnB application.

    Attributes:
        first_name (str): User's first name (max 50 chars).
        last_name (str): User's last name (max 50 chars).
        email (str): Unique email address (validated format).
        password (str): Bcrypt-hashed password (min 8 chars before hashing).
        is_admin (bool): Whether the user has admin privileges.
    """
```

---

## 🧪 Testing

```bash
# Run all tests
cd part2/hbnb   # or part3/hbnb
python -m unittest discover -s tests -p "test_api_v1_full.py"

# Expected output: OK (XX tests)
```

The test suite covers:
- User CRUD operations
- Amenity management
- Place creation with validation
- Review submission and deletion
- Edge cases (missing fields, invalid values, unauthorized access)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit with clear messages (`git commit -m 'feat: add JWT refresh token support'`)
4. Push and open a Pull Request to `develop`

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Maxime Regnier**  
Holberton School Student — France  
GitHub: [@Maxime-Regnier](https://github.com/Maxime-Regnier)  
LinkedIn: [maxime-régnier](https://www.linkedin.com/in/maxime-régnier/)

---

**Built with ❤️ at Holberton School France**

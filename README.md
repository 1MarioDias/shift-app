# SHIFT - Event Management Portal

SHIFT is a full-stack web application designed to facilitate event management in smart cities. The platform allows users to create, manage, and participate in various events, promoting community involvement and enhancing the overall quality of life for urban residents.

---

## Table of Contents

- [Features](#features)
  - [User Features](#user-features)
  - [Administrator Features](#administrator-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
  - [Backend Integration Tests](#backend-integration-tests)
  - [Frontend Unit & API Tests](#frontend-unit--api-tests)
  - [Frontend End-to-End (E2E) Tests](#frontend-end-to-end-e2e-tests)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)
- [Preview Video](#preview-video)
- [Project Structure](#project-structure)

---

## Features

### User Features

-   **Authentication**: Secure user registration and login with JWT-based sessions.
-   **Event Discovery**: Browse, search, and filter a comprehensive list of public events.
-   **Event Management**: Create, update, and delete your own events.
-   **Participation**: Register to attend events and manage your participation status.
-   **Favorites**: Mark events as favorites for easy access later.
-   **Commenting**: Engage in discussions by posting comments on event pages.
-   **User Profile**: View your profile, including events you've created, favorited, and are participating in.
-   **Notifications**: Receive updates for important event-related activities.

### Administrator Features

-   **Full User Management**: View a list of all registered users and delete user accounts.
-   **Comprehensive Event Oversight**: Access and manage all events, including private ones.
-   **Content Moderation**: Delete any comment on the platform to maintain community standards.

---

## Tech Stack

-   **Frontend**: Vue.js, Tailwind CSS, Vite
-   **Backend**: Node.js, Express.js
-   **Database**: MySQL with Sequelize ORM
-   **Authentication**: JSON Web Tokens (JWT)
-   **Image Storage**: Cloudinary for cloud-based image uploads and management.
-   **Testing**:
    -   **Backend**: Jest & Supertest
    -   **Frontend (Unit/API)**: Jest
    -   **Frontend (E2E)**: Selenium WebDriver with Jest

---

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   [NPM](https://www.npmjs.com/) (v9.x or later)
-   A running [MySQL](https://www.mysql.com/) server instance.
-   A [Cloudinary](https://cloudinary.com/) account for image hosting.

---

## Installation & Setup

### Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    Create a `.env` file in the `server` directory and populate it with your configuration. Use `.env.example` as a template.

    ```env
    # Server Configuration
    PORT=3000
    HOST=127.0.0.1

    # Database Configuration
    DB_HOST=your_db_host
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name

    # Security
    JWT_SECRET=your_super_secret_jwt_key

    # Cloudinary API
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4.  **Database Sync:**
    The application uses Sequelize to automatically sync models with the database upon startup. Ensure your database is running and the `.env` credentials are correct.

### Frontend Setup

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  The client is pre-configured to connect to the backend at `http://127.0.0.1:3000`.

---

## Running the Application

You must start both the backend and frontend servers in separate terminals.

1.  **Start the Backend Server:**
    From the `server` directory:
    ```bash
    nodemon .\app.js
    ```
    The API will be running at `http://127.0.0.1:3000`.

2.  **Start the Frontend Application:**
    From the `client` directory:
    ```bash
    npm run dev
    ```
    The Vue application will be available at `http://localhost:5173`.

---

## Running Tests

### Backend Integration Tests

These tests run against the API endpoints and the database.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Run the tests:**
    ```bash
    npm test
    ```

### Frontend Unit & API Tests

These tests cover API service layers and component logic without rendering them.

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Run the tests:**
    ```bash
    npm test
    ```

### Frontend End-to-End (E2E) Tests

These tests simulate real user interactions in a Chrome browser. **Ensure both the backend and frontend servers are running before executing these tests.**

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Run the E2E tests:**
    ```bash
    npm run test:selenium
    ```

---

## API Endpoints

The following is a summary of the main API routes available.

| Method | Endpoint                       | Description                                    | Authentication | Admin Only |
| :----- | :----------------------------- | :--------------------------------------------- | :------------- | :--------- |
| `POST` | `/users`                       | Register a new user.                           | Public         | No         |
| `POST` | `/users/login`                 | Log in a user.                                 | Public         | No         |
| `GET`  | `/users/me`                    | Get the authenticated user's profile.          | User           | No         |
| `GET`  | `/users`                       | Get a list of all users.                       | Admin          | Yes        |
| `DELETE`| `/users/:userId`               | Delete a user account.                         | Admin          | Yes        |
| `GET`  | `/events`                      | Get a list of events (public or all).          | Optional       | No         |
| `POST` | `/events`                      | Create a new event.                            | User           | No         |
| `GET`  | `/events/:eventId`             | Get details for a specific event.              | Optional       | No         |
| `PUT`  | `/events/:eventId`             | Update an event.                               | Owner/Admin    | No         |
| `DELETE`| `/events/:eventId`             | Delete an event.                               | Owner/Admin    | No         |
| `GET`  | `/events/:eventId/comments`    | Get all comments for an event.                 | Public         | No         |
| `POST` | `/events/:eventId/comments`    | Add a comment to an event.                     | User           | No         |
| `DELETE`| `/comments/:commentId`         | Delete a comment.                              | Owner/Admin    | No         |
| `GET`  | `/favorites`                   | Get the user's favorite events.                | User           | No         |
| `POST` | `/favorites/:eventId`          | Add an event to favorites.                     | User           | No         |
| `DELETE`| `/favorites/:eventId`          | Remove an event from favorites.                | User           | No         |
| `GET`  | `/notifications`               | Get the user's notifications.                  | User           | No         |
| `PATCH`| `/notifications/:notificationId`| Mark a notification as read/unread.            | User           | No         |

---

## API Documentation

[SHIFT APP API](https://documenter.getpostman.com/view/43210142/2sB2x8ErAm#188287c7-fc8e-469b-95d2-7883bd062f0e)

---

## Preview Video

[SHIFT APP - Full-Stack Web Application for an Event Management Portal](https://youtu.be/1Xf_FAPLcxE)

---

## Project Structure

The project is organized into two main folders:

-   `client/`: Contains the Vue.js frontend application, including components, views, API services, and tests.
-   `server/`: Contains the Express.js backend, including controllers, routes, models, middleware, and tests.
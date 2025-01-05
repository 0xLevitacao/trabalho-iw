# Movies DB

A simple web app for managing and displaying a movie collection using the MERN stack (MongoDB, ExpressJS, ReactJS and NodeJS)

## Features

### Public View
- Browse movies in a responsive grid layout
- Search movies by title or director
- Filter movies by genre
- View detailed movie information in a modal

### Admin Dashboard (/admin)
- Add, edit, and delete movies
- Search functionality
- Tabular view of movie database

## Tech Stack

- **Frontend:** React.js, Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## Setup

1. Clone the repository
2. Install dependencies in the backend and the frontend folder:
   ```bash
   npm install
   ```
3. Create a .env file in the root directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_PASSWORD=your_admin_password
   ```
4. Run both the backend and the frontend with:
   ```bash
   npm start
   ```

# StudioSpace — Backend API

The backend REST API for StudioSpace, a full-stack studio rental platform. Built with Node.js, Express, TypeScript, and MongoDB.

**Production API:** https://studiospace-server-h7p3.onrender.com

**Frontend:** https://studiospace-a-08.vercel.app

## Overview

StudioSpace Backend provides the REST API and server-side functionality required by the StudioSpace frontend.

It handles authentication, studio management, image uploads, bookings, reviews, and database operations.

## Features

- **Authentication:** Better Auth integration with email/password and Google authentication.
- **JWT Authentication:** Custom JWT generation and verification using HTTP-only cookies.
- **Studio Management:** Create, retrieve, update, and delete studio listings.
- **Studio Ownership:** Restrict listing modifications to their owners.
- **Studio Discovery:** Retrieve all studios and featured listings.
- **Image Upload:** Upload images using the ImgBB API.
- **Booking Management:** Create, retrieve, and cancel bookings.
- **Double Booking Prevention:** Prevent overlapping reservations for the same studio.
- **Review Management:** Handle studio reviews.
- **CORS Configuration:** Configured for frontend and local development origins.
- **MongoDB Integration:** Persistent data storage using MongoDB.

## Technology Stack

| Category             | Technologies         |
| -------------------- | -------------------- |
| Runtime              | Node.js              |
| Framework            | Express.js 5         |
| Language             | TypeScript           |
| Database             | MongoDB              |
| Authentication       | Better Auth          |
| Token Authentication | JSON Web Token (JWT) |
| Image Hosting        | ImgBB                |
| Middleware           | CORS, Cookie Parser  |
| Deployment           | Render               |

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB database
- ImgBB API key

### Installation

Clone the repository:

```bash
git clone https://github.com/tanvir134338/studiospace-server.git
```

Navigate to the project directory:

```bash
cd studiospace-server
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

IMGBB_API_KEY=your_imgbb_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FRONTEND_URL=http://localhost:3000
```

**Important:** Replace all placeholder values with your own credentials. Never commit `.env` files or expose secret keys in a public repository.

## Running the Server

### Development

```bash
npm run dev
```

The development server runs at:

http://localhost:5000

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Endpoints

Base URL:

```text
http://localhost:5000
```

### Health Check

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| GET    | `/api/health` | Check server health |

### Authentication

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| POST   | `/api/session/jwt`    | Generate custom JWT |
| POST   | `/api/session/logout` | Clear JWT cookie    |

Better Auth also handles authentication and session management.

### Studios

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/studios`             | Retrieve all studios            |
| GET    | `/api/studios/featured`    | Retrieve featured studios       |
| GET    | `/api/studios/my-listings` | Retrieve current user's studios |
| GET    | `/api/studios/:id`         | Retrieve studio details         |
| POST   | `/api/studios`             | Create a studio                 |
| PATCH  | `/api/studios/:id`         | Update a studio                 |
| DELETE | `/api/studios/:id`         | Delete a studio                 |

### Image Upload

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| POST   | `/api/upload` | Upload a studio image |

### Bookings

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| POST   | `/api/bookings`             | Create a booking           |
| GET    | `/api/bookings/my-bookings` | Retrieve personal bookings |
| PATCH  | `/api/bookings/:id/cancel`  | Cancel a booking           |

### Reviews

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/api/reviews/:studioId` | Retrieve studio reviews |
| POST   | `/api/reviews`           | Submit a studio review  |

## Project Structure

```text
src/
├── config/
│   ├── auth.ts
│   └── db.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── studio.controller.ts
│   └── upload.controller.ts
├── middleware/
│   ├── upload.ts
│   ├── verifyAuth.ts
│   └── verifyJWT.ts
├── models/
├── routes/
├── utils/
│   └── jwt.ts
├── app.ts
└── server.ts
```

## Deployment

The backend is deployed on Render.

**Production API:**

https://studiospace-server-h7p3.onrender.com

### Health Check

```text
GET https://studiospace-server-h7p3.onrender.com/api/health
```

## Related Repository

**Frontend Repository:** https://github.com/tanvir134338/studiospace

> If your frontend repository uses a different GitHub URL, update this link.

## Developer

**Tanvir**

GitHub: https://github.com/tanvir134338

---

Built with Node.js, Express, TypeScript, and MongoDB.

# PREYTweet Backend

> A scalable backend powering a modern social media platform, designed with production-oriented architecture and backend engineering best practices.

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-Search-005571?logo=elasticsearch)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio)

</p>

---

# Overview

PREYTweet is a backend-centric social media platform built to explore production backend concepts beyond traditional CRUD applications.

The project focuses on authentication, caching, realtime communication, search, scalability, and clean backend architecture while maintaining a modular and extensible codebase.

---

# Architecture

```
                        React Frontend
                               │
                    REST API / Socket.IO
                               │
                     Express Backend API
          ┌────────────┬────────────┬────────────┐
          │            │            │            │
      MongoDB       Redis     Elasticsearch   Cloudinary
     (Database)    (Cache)      (Search)      (Storage)
                               │
                     Socket.IO Service
```

---

# Core Features

## Authentication

- JWT Authentication
- Access & Refresh Tokens
- Secure HTTP-only Cookies
- OAuth Login (Google) *(if implemented)*

## Social Features

- Video Uploads
- Likes
- Comments
- Subscriptions
- Notifications
- User Profiles

## Realtime

- One-to-One Messaging
- Read Receipts
- Live Notifications
- Socket.IO Microservice

## Performance

- Redis Cache-Aside Pattern
- Cache Invalidation
- Aggregation Pipelines
- Pagination
- Elasticsearch Full-Text Search

## Security

- Helmet
- Rate Limiting
- Input Validation
- Secure Cookies
- CORS Configuration
- Environment Validation

## Infrastructure

- Dockerized Services
- Graceful Shutdown
- Structured Logging
- Health Check Endpoint

---

# Technology Stack

| Category | Technologies |
|-----------|--------------|
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Cache | Redis |
| Search | Elasticsearch |
| Realtime | Socket.IO |
| Storage | Cloudinary |
| Containerization | Docker |
| Authentication | JWT, OAuth |
| Logging | Winston / Pino |

---

# Project Structure

```
src
│
├── config
├── controllers
├── middlewares
├── models
├── routes
├── services
├── utils
├── validators
├── sockets
└── server.js
```

---

# Running Locally

## Clone

```bash
git clone <repository-url>
cd PREYTweet-Backend
```

## Environment

```bash
cp .env.example .env
```

Configure the required variables.

## Start

```bash
docker compose up --build
```

---

# Design Decisions

- MongoDB is the source of truth.
- Redis follows the Cache-Aside strategy.
- Elasticsearch provides full-text search.
- Cloudinary handles media storage.
- Socket.IO runs as a dedicated realtime service.
- Docker ensures reproducible development and deployment environments.

---

## Why Redis?

Redis is used as a cache layer to reduce database load on frequently accessed endpoints. The application follows the Cache-Aside pattern with explicit cache invalidation on writes.

## Why Elasticsearch?

MongoDB remains the primary database while Elasticsearch provides fuzzy full-text search with significantly better search capabilities.

## Why Socket.IO as a Separate Service?

Separating realtime communication from the REST API improves scalability and allows independent deployment and scaling of websocket traffic.

---

# Future Improvements

- Background Jobs (BullMQ)
- Monitoring (Prometheus + Grafana)
- CI/CD Pipeline
- Distributed Socket Scaling
- API Versioning

---

# License

MIT

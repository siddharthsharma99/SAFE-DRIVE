# SAFE-DRIVE: Automated Accident Detection and Emergency Alert System

## Overview

SAFE-DRIVE is a full-stack web application designed to detect potential road accidents and provide emergency assistance by sending alerts and location information to emergency contacts.

The system uses sensor-based accident data, GPS location tracking, and real-time alert management to reduce emergency response time during road accidents.

---

## Features

* Accident detection and severity classification
* Real-time emergency alerts
* GPS location tracking
* Emergency contact management
* Driver profile management
* Secure user authentication
* Dashboard for monitoring incidents and statistics
* Firebase cloud database integration

---

## Technology Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database & Cloud

* Firebase Authentication
* Firebase Firestore

---

## Project Structure

```bash
src/
├── components/
├── pages/
├── services/
├── App.tsx
├── main.tsx
├── types.ts
├── index.css

server.ts
package.json
firestore.rules
```

## Installation

1. Clone the repository

```bash
git clone <repository-url>
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file and add your Firebase and Gemini API credentials.

4. Start the development server

```bash
npm run dev
```

---

## Future Enhancements

* Real-time mobile application integration
* Machine Learning based accident prediction
* SMS and voice call emergency notifications
* Integration with emergency services

---

## Author

Siddharth Sharma

B.Tech Computer Science Engineering

Final Year Project

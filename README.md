# Mini SaaS Video Streaming Platform (MVP)

A Netflix-like video streaming platform built with React Native (mobile) and Node.js (backend), featuring adaptive HLS video streaming, user authentication, search, and tag-based filtering.

## 🎯 Features

- **User Authentication**: Email/password registration and login with bcrypt encryption
- **Video Discovery**: Browse video library with thumbnails and metadata
- **Search & Filter**: Real-time search by title and multi-tag filtering
- **Video Details**: Detailed view with clickable tags for contextual navigation
- **Adaptive Streaming**: HLS (.m3u8) video playback support
- **Responsive UI**: Netflix-inspired dark theme interface

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** for relational data storage
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### Mobile App
- **React Native** with TypeScript
- **React Navigation** for screen routing
- **Axios** for API calls
- **Expo** compatible

### Database
- **MySQL 8.0+**
- Tables: users, videos, tags, video_tags (M-to-M relationship)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Android Studio (for Android emulator) or physical device

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mini-streaming-app
```

### 2. Database Setup

**Start MySQL and create the database:**
```bash
mysql -u root -p < database/schema.sql
```

This will:
- Create `mini_streaming_app` database
- Create all required tables (users, videos, tags, video_tags)
- Insert 4 sample videos with tags

**Verify database creation:**
```bash
mysql -u root -p
USE mini_streaming_app;
SHOW TABLES;
SELECT * FROM videos;
```

### 3. Backend Setup

```bash
cd backend
npm install
```

**Configure database connection:**
Edit `backend/src/config/db.js` if needed:
```javascript
module.exports = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',
  database: 'mini_streaming_app'
});
```

**Start the backend server:**
```bash
node server.js
```

Server will run on `http://localhost:5000`

You should see:
```
✅ MySQL connected
🚀 Server running on http://0.0.0.0:5000
```

### 4. Mobile App Setup

```bash
cd mobile-app
npm install
```

**Start the development server:**
```bash
npm start
```

**Run on Android Emulator:**
- Press `a` in the terminal, or
- Open Android Studio and start an emulator
- The app will automatically connect to backend at `http://10.0.2.2:5000`

## 📱 App Structure

```
mobile-app/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Navigation stack
│   ├── screens/
│   │   ├── LoginScreen.tsx        # User login
│   │   ├── RegisterScreen.tsx     # User registration
│   │   ├── HomeScreen.tsx         # Video browsing & search
│   │   ├── VideoDetailScreen.tsx  # Video details with tags
│   │   └── PlayerScreen.tsx       # Video player (placeholder)
│   └── services/
│       └── api.ts                 # Axios API configuration
└── App.tsx                        # Root component
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

- `POST /auth/login` - Login user
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

### Videos
- `GET /videos` - Get all videos with tags
- `GET /videos/:id` - Get single video by ID
- `GET /videos/search?q=title&tags=Sports,4K` - Search videos

## 🎬 Sample Videos

The app includes 4 pre-configured HLS video streams:

1. **Skate Phantom Flex 4K** - Skateboarding footage in 4K
2. **Fitness Workout Session** - High-intensity workout
3. **Demo Video Stream** - Test stream for adaptive playback
4. **Advanced Training Program** - Professional training content

All videos support adaptive bitrate streaming (HLS).

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  stream_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_title (title)
);
```

### Tags & Video_Tags (M-to-M)
```sql
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE video_tags (
  video_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (video_id, tag_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 🔧 Troubleshooting

### Backend Issues

**Database connection failed:**
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `backend/src/config/db.js`
- Ensure database exists: `SHOW DATABASES;`

**Port 5000 already in use:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

### Mobile App Issues

**Cannot connect to backend:**
- For Android Emulator, use `http://10.0.2.2:5000`
- For iOS Simulator, use `http://localhost:5000`
- For physical device, use your computer's IP address

**Registration/Login fails:**
- Check backend console for error messages
- Verify database tables exist
- Check network connectivity

**Module not found errors:**
```bash
cd mobile-app
rm -rf node_modules package-lock.json
npm install
```

## 🎨 UI Features

- **Netflix-inspired dark theme** (Black #000, Red #E50914)
- **Real-time search** with instant filtering
- **Multi-tag selection** for advanced filtering
- **Clickable tags** for contextual navigation
- **Responsive video cards** with thumbnails
- **Loading states** and empty states

## 🔐 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- SQL injection prevention with parameterized queries
- CORS enabled for cross-origin requests
- Error handling with detailed logging

## 📝 Future Enhancements

- [ ] JWT-based session management
- [ ] OAuth integration (Google, GitHub)
- [ ] Actual HLS video player implementation
- [ ] User profiles and watch history
- [ ] Video upload functionality
- [ ] Comments and ratings
- [ ] Admin dashboard
- [ ] Web application (React)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer Notes

### Android Emulator Network
- Android emulator uses `10.0.2.2` to access host machine's `localhost`
- Backend must listen on `0.0.0.0` to accept emulator connections

### Database Design
- M-to-M relationship between videos and tags for flexible categorization
- Indexed title column for faster search queries
- Cascade delete for referential integrity

### API Design
- RESTful endpoints with proper HTTP status codes
- Consistent error response format
- Detailed console logging for debugging

---

**Built with ❤️ for learning purposes**

CREATE DATABASE IF NOT EXISTS netflix;
USE netflix;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  stream_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_title (title)
);

CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS video_tags (
  video_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (video_id, tag_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

INSERT INTO videos (title, description, thumbnail_url, stream_url) VALUES
('Skate Phantom Flex 4K', 'Amazing skateboarding footage captured in stunning 4K quality with Phantom Flex camera', 'https://via.placeholder.com/300x170/E50914/FFFFFF?text=Skate+4K', 'http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8'),
('Fitness Workout Session', 'High-intensity workout session to keep you fit and healthy', 'https://via.placeholder.com/300x170/E50914/FFFFFF?text=Fitness', 'https://flipfit-cdn.akamaized.net/flip_hls/662aae7a42cd740019b91dec-3e114f/video_h1.m3u8'),
('Demo Video Stream', 'Test stream for adaptive bitrate playback demonstration', 'https://via.placeholder.com/300x170/E50914/FFFFFF?text=Demo+Stream', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'),
('Advanced Training Program', 'Professional training program for advanced fitness enthusiasts', 'https://via.placeholder.com/300x170/E50914/FFFFFF?text=Training', 'https://flipfit-cdn.akamaized.net/flip_hls/664d87dfe8e47500199ee49e-dbd56b/video_h1.m3u8');

INSERT INTO tags (name) VALUES
('Sports'),
('4K'),
('Skateboarding'),
('Fitness'),
('Workout'),
('Training'),
('Demo'),
('HD');

INSERT INTO video_tags (video_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 8),
(3, 7), (3, 8),
(4, 4), (4, 6), (4, 8);

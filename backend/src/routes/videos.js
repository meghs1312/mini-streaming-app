const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [videos] = await db.query(`
      SELECT 
        v.id,
        v.title,
        v.description,
        v.thumbnail_url,
        v.stream_url,
        GROUP_CONCAT(t.name) as tags
      FROM videos v
      LEFT JOIN video_tags vt ON v.id = vt.video_id
      LEFT JOIN tags t ON vt.tag_id = t.id
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `);

    const formattedVideos = videos.map(video => ({
      ...video,
      tags: video.tags ? video.tags.split(',') : []
    }));

    res.json(formattedVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [videos] = await db.query(`
      SELECT 
        v.id,
        v.title,
        v.description,
        v.thumbnail_url,
        v.stream_url,
        GROUP_CONCAT(t.name) as tags
      FROM videos v
      LEFT JOIN video_tags vt ON v.id = vt.video_id
      LEFT JOIN tags t ON vt.tag_id = t.id
      WHERE v.id = ?
      GROUP BY v.id
    `, [id]);

    if (videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = {
      ...videos[0],
      tags: videos[0].tags ? videos[0].tags.split(',') : []
    };

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, tags } = req.query;
    let query = `
      SELECT DISTINCT
        v.id,
        v.title,
        v.description,
        v.thumbnail_url,
        v.stream_url,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM videos v
      LEFT JOIN video_tags vt ON v.id = vt.video_id
      LEFT JOIN tags t ON vt.tag_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      query += ` AND v.title LIKE ?`;
      params.push(`%${q}%`);
    }

    if (tags) {
      const tagArray = tags.split(',');
      query += ` AND v.id IN (
        SELECT vt2.video_id 
        FROM video_tags vt2
        JOIN tags t2 ON vt2.tag_id = t2.id
        WHERE t2.name IN (${tagArray.map(() => '?').join(',')})
        GROUP BY vt2.video_id
        HAVING COUNT(DISTINCT t2.name) = ?
      )`;
      params.push(...tagArray, tagArray.length);
    }

    query += ` GROUP BY v.id ORDER BY v.created_at DESC`;

    const [videos] = await db.query(query, params);

    const formattedVideos = videos.map(video => ({
      ...video,
      tags: video.tags ? video.tags.split(',') : []
    }));

    res.json(formattedVideos);
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

module.exports = router;

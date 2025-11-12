// getting express here and making router
const express = require('express');
const router = express.Router();

// other imports we need
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Candidate = require('../models/Candidate');

// using memory storage (no need to save files locally)
const memStorage = multer.memoryStorage();

// upload setup for resume files — only PDF and max 5MB
const resumeUpload = multer({
  storage: memStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Resume must be a PDF'));
    }
    cb(null, true);
  },
});

// upload setup for video (frontend controls 90s)
const videoUpload = multer({ storage: memStorage });

// helper to get GridFS bucket
function getBucket() {
  const db = mongoose.connection.db;
  return new GridFSBucket(db, { bucketName: 'uploads' });
}

// save candidate info + resume
router.post('/info', resumeUpload.single('resume'), async (req, res) => {
  try {
    const { firstName, lastName, positionApplied, currentPosition, experienceYears } = req.body;

    // just checking if all fields are filled
    if (!firstName || !lastName || !positionApplied || !currentPosition || !experienceYears) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // checking if resume file came
    if (!req.file) return res.status(400).json({ error: 'Resume file is required' });

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    // putting the file into GridFS
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async (file) => {
      
      // now save candidate info with resume file id
      const candidate = new Candidate({
        firstName,
        lastName,
        positionApplied,
        currentPosition,
        experienceYears: Number(experienceYears),
        resumeFileId: file._id,
      });

      await candidate.save();
      console.log('New candidate saved:', candidate._id.toString());
      res.json({ candidateId: candidate._id });
    });

    uploadStream.on('error', (err) => {
      console.error('Resume upload failed:', err.message);
      res.status(500).json({ error: 'Failed to upload resume' });
    });
  } catch (err) {
    console.error('Error in /info route:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// upload video for a candidate
router.post('/video/:candidateId', videoUpload.single('video'), async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!req.file) return res.status(400).json({ error: 'Video file required' });

    const cand = await Candidate.findById(candidateId);
    if (!cand) return res.status(404).json({ error: 'Candidate not found' });

    const bucket = getBucket();
    const filename = `video_${candidateId}_${Date.now()}.webm`;

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async (file) => {
      cand.videoFileId = file._id;
      await cand.save();
      console.log(`Video uploaded for ${candidateId}`);
      res.json({ success: true });
    });

    uploadStream.on('error', (err) => {
      console.error('Video upload failed:', err.message);
      res.status(500).json({ error: 'Failed to upload video' });
    });
  } catch (err) {
    console.error('Error in /video upload:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// get candidate info
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).lean();
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    console.error('Error getting candidate:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// download resume file
router.get('/resume/:candidateId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId).lean();
    if (!candidate || !candidate.resumeFileId)
      return res.status(404).json({ error: 'Resume not found' });

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(candidate.resumeFileId);
    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume_${candidate._id}.pdf`);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Error streaming resume:', err.message);
      res.status(404).end('Resume not found');
    });
  } catch (err) {
    console.error('Error in resume route:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// stream video file
router.get('/video/:candidateId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId).lean();
    if (!candidate || !candidate.videoFileId)
      return res.status(404).json({ error: 'Video not found' });

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(candidate.videoFileId);
    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader('Content-Type', 'video/webm');
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Error streaming video:', err.message);
      res.status(404).end('Video not found');
    });
  } catch (err) {
    console.error('Error in video route:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// exporting router so we can use it in server.js
module.exports = router;

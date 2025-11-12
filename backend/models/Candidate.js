// getting mongoose here
const mongoose = require('mongoose');

// making a new schema for candidate info
const CandidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, // candidate first name
  lastName: { type: String, required: true }, // candidate last name
  positionApplied: { type: String, required: true }, // which role applied for
  currentPosition: { type: String, required: true }, // what they’re doing right now
  experienceYears: { type: Number, required: true }, // total work experience in years
  resumeFileId: { type: mongoose.Schema.Types.ObjectId }, // id of uploaded resume file
  videoFileId: { type: mongoose.Schema.Types.ObjectId },  // id of uploaded video file
  createdAt: { type: Date, default: Date.now } // when this record got created
});

// exporting so we can use this model anywhere when we need it.
module.exports = mongoose.model('Candidate', CandidateSchema);

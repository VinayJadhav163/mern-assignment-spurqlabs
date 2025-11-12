// pulling all the things we need
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectMongoose } = require('./config/db');
const candidateRoutes = require('./routes/candidates');

// load env variables (from .env file)
dotenv.config();

const app = express();

// allow frontend (React) to connetc with this backend
app.use(cors({
  origin: "http://localhost:3000", // my React app runs on this port
  exposedHeaders: ["Content-Disposition"], // so we can handle file downloads
}));

// handle json data (used for form submissions etc)
app.use(express.json({ limit: '10mb' })); // keeping limit high for safety

// connect to MongoDB
connectMongoose();

// all candidate-related routes are here
app.use('/api/candidates', require("./routes/candidates"));

// check route to see if backend is working
app.get('/', (req, res) => res.send('Candidate API is up.'));

// we starting the server here
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

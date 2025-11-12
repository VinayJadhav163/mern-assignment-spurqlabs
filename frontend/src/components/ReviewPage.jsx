// Importing all the things we need
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

const ReviewPage = () => {
  // to store candidate data and error message
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { candidateId } = location.state || {};

  // when page loads, we check if we got candidate id
  useEffect(() => {
    if (!candidateId) {
      setError("Candidate ID missing. Please fill out the form again.");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    // fetch candidate data from backend
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/candidates/${candidateId}`
        );
        setCandidate(res.data);
      } catch (err) {
        console.error("Error fetching candidate:", err);
        setError("Failed to load candidate details. Please try again.");
      }
    };

    fetchData();
  }, [candidateId, navigate]);

  // if something went wrongthen show error
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  // show loading text until we get data of candidate
  if (!candidate)
    return <div className="text-center mt-5">Loading candidate details...</div>;

  // Here is the UI part
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <motion.div
        className="card shadow-lg p-4 w-100"
        style={{
          maxWidth: "700px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(6px)",
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* heading text */}
        <motion.h3
          className="text-center fw-bold mb-3"
          style={{
            background: "linear-gradient(90deg, #6f42c1, #007bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.9rem",
          }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Review Your Submission
        </motion.h3>

        {/* showing candidate details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="mb-4 px-2">
            <p>
              <strong>First Name:</strong> {candidate.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {candidate.lastName}
            </p>
            <p>
              <strong>Position Applied:</strong> {candidate.positionApplied}
            </p>
            <p>
              <strong>Current Position:</strong> {candidate.currentPosition}
            </p>
            <p>
              <strong>Experience:</strong> {candidate.experienceYears} years
            </p>
          </div>

          {/* button to download resume */}
          <div className="mb-4">
            <a
              href={`http://localhost:5000/api/candidates/resume/${candidate._id}`}
              download={`Resume_${candidate.firstName}_${candidate.lastName}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn w-100 fw-semibold"
              style={{
                background: "linear-gradient(135deg, #6f42c1, #007bff)",
                color: "white",
                border: "none",
              }}
            >
              Download Resume
            </a>
          </div>

          {/* showing recorded vide */}
          <h5 className="text-center fw-semibold" style={{ color: "#444" }}>
            Recorded Video
          </h5>
          <div className="text-center">
            <video
              controls
              className="w-100 border rounded shadow-sm mt-2"
              style={{ maxHeight: "400px" }}
            >
              <source
                src={`http://localhost:5000/api/candidates/video/${candidate._id}`}
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* here are two buttons to go back and print summary */}
          <div
            className="text-center mt-4 d-flex flex-wrap justify-content-center gap-3"
            style={{ alignItems: "center" }}
          >
            <div
              style={{
                flex: "1 1 200px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <motion.button
                className="btn fw-semibold"
                style={{
                  background: "linear-gradient(135deg, #6f42c1, #007bff)",
                  color: "white",
                  border: "none",
                  minWidth: "180px",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/")}
              >
                Submit Another Response
              </motion.button>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <motion.button
                className="btn fw-semibold"
                style={{
                  background: "linear-gradient(135deg, #4a00e0, #8e2de2)",
                  color: "white",
                  border: "none",
                  minWidth: "180px",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.print()}
              >
                Print Summary
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReviewPage;

// importing all the things we need
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

const CandidateForm = () => {
  // storing all form details here
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    positionApplied: "",
    currentPosition: "",
    experienceYears: "",
    resume: null,
  });

  // for showing error message or loading status
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // when user types or uploads something, update state
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value, // handle both text and file inputs
    });
  };

  // when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page reload
    setError("");
    setLoading(true);

    const { firstName, lastName, positionApplied, currentPosition, experienceYears, resume } = formData;

    // quick check if everything is filled or not
    if (!firstName || !lastName || !positionApplied || !currentPosition || !experienceYears || !resume) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    // check if uploaded file is a PDF if it not then it will show error
    if (resume && resume.type !== "application/pdf") {
      setError("Resume must be a PDF file.");
      setLoading(false);
      return;
    }

    // check file size (<= 5 MB)
    if (resume && resume.size > 5 * 1024 * 1024) {
      setError("Resume file size must not exceed 5 MB.");
      setLoading(false);
      return;
    }

    try {
      // making form data to send to backend
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));

      // send data to backend
      const res = await axios.post("http://localhost:5000/api/candidates/info", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // getting candidateId from backend
      const candidateId = res.data.candidateId;
      console.log("Saved candidate:", candidateId);

      // saving id to localStorage for next step (video upload)
      localStorage.setItem("candidateId", candidateId);

      // moving to next page
      navigate("/video", { state: { candidateId } });
    } catch (err) {
      console.error("Error submitting candidate form:", err);
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Here is all the UI part
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
    >
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
        {/* heading */}
        <motion.h3
          className="fw-bold text-center mb-4"
          style={{
            background: "linear-gradient(90deg, #6f42c1, #007bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Candidate Information Form
        </motion.h3>

        {/* the actual form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* first and last name */}
          <div className="row mb-3">
            <div className="col">
              <label className="form-label fw-semibold">First Name *</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label fw-semibold">Last Name *</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* job details */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Position Applied For *</label>
            <input
              type="text"
              className="form-control"
              name="positionApplied"
              value={formData.positionApplied}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Current Position *</label>
            <input
              type="text"
              className="form-control"
              name="currentPosition"
              value={formData.currentPosition}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Experience (Years) *</label>
            <input
              type="number"
              className="form-control"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          {/* upload resume */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Upload Resume (PDF, ≤ 5 MB)</label>
            <input
              type="file"
              className="form-control"
              name="resume"
              accept="application/pdf"
              onChange={handleChange}
              required
            />
          </div>

          {/* if error, show here */}
          {error && <p className="text-danger text-center">{error}</p>}

          {/* submit button */}
          <motion.button
            type="submit"
            className="btn w-100 fw-semibold"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #6f42c1, #007bff)",
              color: "white",
              border: "none",
              transition: "0.3s",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Submitting..." : "Next ➜"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default CandidateForm;

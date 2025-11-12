// importing all the things we need here
import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

const VideoInstructions = () => {
  // few states to keep track of what's happening
  const [status, setStatus] = useState("");
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);

  // refs for timer, video element, recorder, etc.
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const recorder = useRef(null);
  const chunks = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { candidateId } = location.state || {};

  // start recording function here
  const startRecording = async () => {
    // just in case user lands here without submitting form
    if (!candidateId) {
      alert("Candidate ID missing — please re-submit your form.");
      navigate("/");
      return;
    }

    try {
      // taking permission to use camera and mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // showing video preview
      videoRef.current.srcObject = stream;

      // setting up recorder
      recorder.current = new MediaRecorder(stream);
      chunks.current = [];

      recorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      // when user stops recording, video will be uploaded
      recorder.current.onstop = uploadVideo;
      recorder.current.start();

      setRecording(true);
      setStatus("Recording started — maximum 90 seconds.");
      setTime(0);

      // start timer to show recording time
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);

      // automatically stop after 90 seconds if it comes to that then it will show alert message
      setTimeout(() => {
        if (recorder.current?.state === "recording") {
          recorder.current.stop();
          clearInterval(timerRef.current);
          setRecording(false);
          setStatus("Recording limit exceeded (90 seconds). Please retry.");
          alert("Recording time limit reached — maximum allowed is 90 seconds.");
        }
      }, 90000);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or unavailable.");
    }
  };

  // stop recording manually when user wants
  const stopRecording = () => {
    if (recorder.current && recorder.current.state === "recording") {
      recorder.current.stop();
      clearInterval(timerRef.current);
      setRecording(false);
      setStatus("Recording stopped manually.");
    }
  };

  // upload recorded video to backend
  const uploadVideo = async () => {
    const blob = new Blob(chunks.current, { type: "video/webm" });
    const fd = new FormData();
    fd.append("video", blob);

    try {
      setStatus("Uploading video...");
      await axios.post(`http://localhost:5000/api/candidates/video/${candidateId}`, fd);
      setStatus("Video uploaded successfully");
      navigate("/review", { state: { candidateId } });
    } catch (err) {
      console.error("Video upload failed:", err);
      setStatus("Upload failed. Please retry.");
    }
  };

  // here is the UI
  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
    >
      <motion.div
        className="card shadow-lg p-4 w-100 pt-3 pb-3"
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
        <motion.h4
          className="text-center fw-bold mb-3"
          style={{
            background: "linear-gradient(90deg, #6f42c1, #007bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.8rem",
            marginBottom: "0.rem",
          }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Video Recording Instructions
        </motion.h4>

        {/* points to speak in video */}
        <motion.ul
          className="list-group list-group-flush mb-4 custom-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <li>Introduce yourself briefly.</li>
          <li>Why are you interested in this position?</li>
          <li>Highlight your key skills or experience.</li>
          <li>Share your long-term career goals.</li>
        </motion.ul>

        {/* little CSS for cleaner bullet list */}
        <style>
          {`
            .custom-list {
              list-style-type: disc;
              padding-left: 1.8rem;
            }

            .custom-list li {
              background: transparent !important;
              font-weight: 600;
              margin-bottom: 8px;
              color: #333;
            }
          `}
        </style>

        {/* video preview section */}
        <motion.div
          className="text-center mb-3 position-relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-100 border rounded shadow-sm"
            style={{
              maxHeight: "360px",
              border: "3px solid transparent",
              borderImage: "linear-gradient(90deg, #6f42c1, #007bff) 1",
            }}
          />

          {/* timer shows up only while recording */}
          {recording && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              ⏱{" "}
              {Math.floor(time / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(time % 60).toString().padStart(2, "0")}
            </div>
          )}
        </motion.div>

        {/* start / stop buttons */}
        <div className="text-center">
          {!recording ? (
            <motion.button
              className="btn fw-semibold me-2"
              onClick={startRecording}
              style={{
                background: "linear-gradient(135deg, #6f42c1, #007bff)",
                color: "white",
                border: "none",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Recording
            </motion.button>
          ) : (
            <motion.button
              className="btn fw-semibold"
              onClick={stopRecording}
              style={{
                background: "linear-gradient(135deg, #6f42c1, #007bff)",
                color: "white",
                border: "none",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Stop Recording
            </motion.button>
          )}
        </div>

        {/* status text at bottom */}
        <p className="text-center mt-3 text-muted fw-semibold">{status}</p>
      </motion.div>
    </div>
  );
};

export default VideoInstructions;

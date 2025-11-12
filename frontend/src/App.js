// importing all things we need
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// our main pages
import CandidateForm from "./components/CandidateForm";
import VideoInstructions from "./components/VideoInstructions";
import ReviewPage from "./components/ReviewPage";

function App() {
  return (
    <Router>
      <div>
        {/*title at the top */}
        <h2
          className="text-center fw-bold mb-10 mt-4"
          style={{
            color: "white",
            fontSize: "2rem",
            letterSpacing: "0.5px",
          }}
        >
          Candidate Submission Portal
        </h2>

        {/* all routes here */}
        <div className="container">
          <Routes>
            {/* form page */}
            <Route path="/" element={<CandidateForm />} />

            {/* video recording page */}
            <Route path="/video" element={<VideoInstructions />} />

            {/* review page */}
            <Route path="/review" element={<ReviewPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

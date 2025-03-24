import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Ex.css"; // Import CSS

const ExerciseTracker = () => {
    const exerciseType = "push-up";
    const [video, setVideo] = useState(null);
    const [repCount, setRepCount] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [mode, setMode] = useState("N/A");
    const [frame, setFrame] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const socket = useRef(null);

    useEffect(() => {
        socket.current = io("https://ai-pose-detection-backend.onrender.com", {
            transports: ["websocket"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socket.current.on("update", (data) => {
            setRepCount(data.rep_count ?? repCount);
            setAccuracy(data.accuracy ?? accuracy);
            setMode(data.mode ?? mode);
            setFrame(data.frame);
            setFeedback(data.feedback ?? feedback);
        });

        return () => socket.current.disconnect();
    }, []);

    const handleFileChange = (e) => setVideo(e.target.files[0]);

    const handleUpload = async () => {
        if (!video) return alert("Please select a video file!");

        const formData = new FormData();
        formData.append("video", video);

        setIsProcessing(true);

        try {
            await axios.post(`https://ai-pose-detection-backend.onrender.com/upload-video/${exerciseType}`, formData);
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="exercise-tracker">
            <h1 className="exercise-title">{exerciseType.toUpperCase()} Tracker</h1>

            <label className="file-input-label">
                Upload Video:
                <input type="file" onChange={handleFileChange} className="file-input" />
            </label>

            <button onClick={handleUpload} className="upload-btn" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Upload Video"}
            </button>

            {frame && <img src={`data:image/jpeg;base64,${frame}`} alt="Live Frame" className="exercise-image" />}

            <div className="stats-container">
                <p><strong>Reps:</strong> {repCount}</p>
                <p><strong>Accuracy:</strong> {accuracy}%</p>
                <p><strong>Mode:</strong> {mode}</p>
                {/* <p className="feedback"><strong>Feedback:</strong> {feedback}</p> */}
            </div>
        </div>
    );
};

export default ExerciseTracker;

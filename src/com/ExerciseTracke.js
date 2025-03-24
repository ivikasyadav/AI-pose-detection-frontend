import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ExerciseTracker = ({ exerciseType }) => {
    const [video, setVideo] = useState(null);
    const [repCount, setRepCount] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [mode, setMode] = useState("N/A");
    const [frame, setFrame] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const socket = useRef(null);

    useEffect(() => {
        socket.current = io("http://localhost:8080", {
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
            await axios.post(`http://localhost:8080/upload-video/${exerciseType}`, formData);
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            <h1>{exerciseType.toUpperCase()} Tracker</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={isProcessing}>{isProcessing ? "Processing..." : "Upload Video"}</button>
            {frame && <img src={`data:image/jpeg;base64,${frame}`} alt="Live Frame" style={{ width: "100%", maxWidth: "500px" }} />}
            <p>Reps: {repCount} | Accuracy: {accuracy}% | Mode: {mode} | Feedback: {feedback}</p>
        </div>
    );
};

export default ExerciseTracker;

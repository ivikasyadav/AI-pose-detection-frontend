import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const LiveExerciseTracker = () => {
    const exerciseType = "biceps-curl";
    const [isLive, setIsLive] = useState(false);
    const [repCount, setRepCount] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [mode, setMode] = useState("N/A");
    const [feedback, setFeedback] = useState("");
    const videoRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize WebSocket connection
        // http://localhost:8080
        socketRef.current = io("https://ai-pose-detection-backend.onrender.com", {
            transports: ["websocket"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketRef.current.on("update", (data) => {
            console.log("WebSocket Data:", data); // Debugging: Log incoming data
            setRepCount(data.rep_count ?? repCount);
            setAccuracy(data.accuracy ?? accuracy);
            setMode(data.mode ?? mode);
            setFeedback(data.feedback ?? feedback);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [repCount, accuracy, mode, feedback]); // Add dependencies

    const startLive = async () => {
        setIsLive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    };

    const stopLive = () => {
        setIsLive(false);
        if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="live-tracker">
            <h1>{exerciseType.toUpperCase()} Live Tracker</h1>
            <video ref={videoRef} autoPlay playsInline className="live-video"></video>
            {!isLive ? (
                <button onClick={startLive} className="start-btn">Start Live</button>
            ) : (
                <button onClick={stopLive} className="stop-btn">Stop Live</button>
            )}

            <div className="stats-container">
                <p><strong>Reps:</strong> {repCount}</p>
                {/* <p><strong>Accuracy:</strong> {accuracy}%</p> */}
                <p><strong>Mode:</strong> {mode}</p>
                <p className="feedback"><strong>Feedback:</strong> {feedback}</p>
            </div>
        </div>
    );
};

export default LiveExerciseTracker;
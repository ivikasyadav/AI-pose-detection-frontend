import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const ExerciseTracke = ({ exerciseType }) => {
    const [video, setVideo] = useState(null);
    const [response, setResponse] = useState(null);
    const [mode, setMode] = useState("N/A");
    const [accuracy, setAccuracy] = useState(0);
    const [repCount, setRepCount] = useState(0);
    const [frame, setFrame] = useState(null);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        const socket = io("http://localhost:5000", { withCredentials: true });

        socket.on("update", (data) => {
            setRepCount(data.rep_count);
            setAccuracy(data.accuracy);
            setMode(data.mode);
            setFrame(data.frame);
            setFeedback(data.feedback);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
        }
    };

    const handleUpload = async () => {
        if (!video) {
            alert("Please select a video file!");
            return;
        }

        const formData = new FormData();
        formData.append("video", video);

        try {
            const res = await axios.post(
                `http://localhost:5000/upload-video/${exerciseType}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            setResponse(res.data);
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Error uploading video!");
        }
    };

    return (
        <div className="App">
            <h1>
                {exerciseType === "push-up"
                    ? "Push-up Tracker"
                    : exerciseType === "biceps-curl"
                        ? "Biceps Curl Tracker"
                        : exerciseType === "squat"
                            ? "Squats Tracker"
                            : exerciseType === "lunge"
                                ? "Lunge Tracker"
                                : exerciseType === "shoulder-press"
                                    ? "Shoulder Press Tracker"
                                    : "Exercise Tracker"}
            </h1>

            <div>
                <input type="file" onChange={handleFileChange} />
            </div>

            <div>
                <button onClick={handleUpload}>Upload Video</button>
            </div>

            <div>
                <h2>Live Results:</h2>
                <p>
                    <strong>Reps Count:</strong> {repCount}
                </p>
                <p>
                    <strong>Accuracy:</strong> {accuracy ? accuracy.toFixed(2) : "0"}%
                </p>
                <p>
                    <strong>Mode:</strong> {mode}
                </p>
                <p>
                    <strong>Feedback:</strong> {feedback}
                </p>
            </div>

            {frame && (
                <div>
                    <h2>Live Video:</h2>
                    <img src={`data:image/jpeg;base64,${frame}`} alt="Live Frame" />
                </div>
            )}

            {response && (
                <div>
                    <h2>Final Results:</h2>
                    <p>
                        <strong>Reps Count:</strong> {response.rep_count}
                    </p>
                    <p>
                        <strong>Accuracy:</strong> {response.accuracy.toFixed(2)}%
                    </p>
                    <p>
                        <strong>Mode:</strong> {response.mode}
                    </p>
                    <p>
                        <strong>Feedback:</strong> {response.feedback}
                    </p>
                    <p>{response.message}</p>
                </div>
            )}
        </div>
    );
};

export default ExerciseTracke;
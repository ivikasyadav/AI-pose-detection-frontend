import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const Biceps_curl = () => {
    const [video, setVideo] = useState(null);
    const [response, setResponse] = useState(null);
    const [mode, setMode] = useState(null); // Track current mode ("up" or "down")
    const [accuracy, setAccuracy] = useState(null); // Track accuracy dynamically
    const [repCount, setRepCount] = useState(0); // Track rep count dynamically
    const [frame, setFrame] = useState(null); // For live video frames

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = io('http://localhost:5000');

        // Listen for live updates from the backend
        socket.on('update', (data) => {
            setRepCount(data.rep_count);
            setAccuracy(data.accuracy);
            setMode(data.mode);
            setFrame(data.frame);  // Update live frame with skeleton and angle
        });

        return () => {
            socket.disconnect(); // Cleanup the socket connection when the component unmounts
        };
    }, []);

    // Handle video file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
        }
    };

    // Handle form submission (video upload)
    const handleUpload = async () => {
        if (!video) {
            alert('Please select a video file!');
            return;
        }

        const formData = new FormData();
        formData.append('video', video);

        try {
            const res = await axios.post('http://localhost:5000/biceps-curl', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResponse(res.data);
            console.log('Response from backend:', res.data);
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error uploading video!');
        }
    };

    return (
        <div className="App">
            <h1>Biceps Curl Rep Tracker</h1>

            <div>
                <input type="file" onChange={handleFileChange} />
            </div>

            <div>
                <button onClick={handleUpload}>Upload Video</button>
            </div>

            <div>
                <h2>Live Results:</h2>
                <p><strong>Reps Count:</strong> {repCount}</p>
                <p><strong>Accuracy:</strong> {accuracy ? accuracy.toFixed(2) : '0'}%</p>
                <p><strong>Mode:</strong> {mode}</p>
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
                    <p><strong>Reps Count:</strong> {response.rep_count}</p>
                    <p><strong>Accuracy:</strong> {response.accuracy.toFixed(2)}%</p>
                    <p><strong>Mode:</strong> {response.mode}</p>
                    <p>{response.message}</p>
                </div>
            )}
        </div>
    );
};

export default Biceps_curl;

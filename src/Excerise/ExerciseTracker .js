import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const ExerciseTracker = ({ exerciseType }) => { // Added exerciseType prop
    const [video, setVideo] = useState(null);
    const [response, setResponse] = useState(null);
    const [mode, setMode] = useState('N/A');
    const [accuracy, setAccuracy] = useState(0);
    const [repCount, setRepCount] = useState(0);
    const [frame, setFrame] = useState(null);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('update', (data) => {
            setRepCount(data.rep_count);
            setAccuracy(data.accuracy);
            setMode(data.mode);
            setFrame(data.frame);
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
            alert('Please select a video file!');
            return;
        }

        const formData = new FormData();
        formData.append('video', video);

        try {
            // Use the exerciseType prop in the API endpoint
            const res = await axios.post(`http://localhost:5000/upload-video/${exerciseType}`, formData, {
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
            <h1>{exerciseType === 'push-up' ? 'Push-up Tracker' : exerciseType === 'biceps-curl' ? 'Biceps Curl Tracker' : exerciseType === 'squat' ? 'Squats Tracker' : 'Exercise Tracker'}</h1>


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

export default ExerciseTracker;

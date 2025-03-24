import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

const App = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [reps, setReps] = useState(0);
    const [kneeAngle, setKneeAngle] = useState(0);
    const squatState = useRef("UP");
    const repsRef = useRef(0);
    const lastRepTime = useRef(0);

    // Calculate angle between three key points
    const calculateAngle = (hip, knee, ankle) => {
        if (hip.score < 0.5 || knee.score < 0.5 || ankle.score < 0.5) return 0;

        const radians =
            Math.atan2(ankle.y - knee.y, ankle.x - knee.x) -
            Math.atan2(hip.y - knee.y, hip.x - knee.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        return angle;
    };

    // Draw skeleton and display knee angle
    const drawSkeleton = (ctx, keypoints, video) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.font = "16px Arial";
        ctx.fillStyle = "yellow";

        const connections = [
            [11, 13], [13, 15], [12, 14], [14, 16],
            [11, 12], [13, 14], [15, 16]
        ];

        connections.forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            if (kp1.score > 0.5 && kp2.score > 0.5) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        });

        keypoints.forEach((point) => {
            if (point.score > 0.5) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            }
        });

        // Display knee angle near knee position
        const leftKnee = keypoints[13];
        if (leftKnee && leftKnee.score > 0.5) {
            ctx.fillText(`${kneeAngle.toFixed(2)}°`, leftKnee.x + 10, leftKnee.y - 10);
        }
    };

    // Load MoveNet model
    const loadModel = async () => {
        try {
            await tf.setBackend("webgl");
            return await posedetection.createDetector(
                posedetection.SupportedModels.MoveNet,
                { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
            );
        } catch (error) {
            console.error("Error loading model:", error);
            return null;
        }
    };

    // Start video stream
    const startVideo = async () => {
        if (navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;

                videoRef.current.onloadedmetadata = () => {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                };
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        }
    };

    // Detect pose and count squats
    const detectPose = async (detector) => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
            requestAnimationFrame(() => detectPose(detector));
            return;
        }

        const poses = await detector.estimatePoses(videoRef.current);

        if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            drawSkeleton(canvasRef.current.getContext("2d"), keypoints, videoRef.current);

            const leftHip = keypoints[11];
            const leftKnee = keypoints[13];
            const leftAnkle = keypoints[15];

            if (leftHip && leftKnee && leftAnkle) {
                const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
                setKneeAngle(angle);

                console.log("Knee Angle:", angle, "Squat State:", squatState.current);

                // Rep-counting logic
                if (squatState.current === "UP" && angle < 90) {
                    squatState.current = "DOWN";
                    console.log("State Changed: DOWN");
                } else if (squatState.current === "DOWN" && angle > 160) {
                    if (Date.now() - lastRepTime.current > 1000) { // 1 sec debounce
                        repsRef.current += 1;
                        setReps(repsRef.current);
                        squatState.current = "UP";
                        lastRepTime.current = Date.now();
                        console.log("Rep Counted! New Reps:", repsRef.current);
                    }
                }
            }
        }
        requestAnimationFrame(() => detectPose(detector));
    };

    useEffect(() => {
        let detector;
        let stream;

        const initialize = async () => {
            detector = await loadModel();
            if (detector) {
                await startVideo();
                detectPose(detector);
            }
        };

        initialize();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (detector) {
                detector.dispose();
            }
        };
    }, []);

    return (
        <div style={{ textAlign: "center", backgroundColor: "#121212", color: "#fff", padding: "20px" }}>
            <h1>Squat Counter</h1>
            <h2>Reps: {reps}</h2>
            <h3>Knee Angle: {kneeAngle.toFixed(2)}°</h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: "400px", border: "2px solid white" }} />
                <canvas ref={canvasRef} width={400} height={400} style={{ border: "2px solid white" }} />
            </div>
        </div>
    );
};

export default App;

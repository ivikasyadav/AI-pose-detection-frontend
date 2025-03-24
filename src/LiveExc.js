import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

const App = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [reps, setReps] = useState(0);
    const [elbowAngle, setElbowAngle] = useState(0);
    const pressState = useRef("DOWN");
    const repsRef = useRef(0);
    const lastRepTime = useRef(0);

    const calculateAngle = (shoulder, elbow, wrist) => {
        if (shoulder.score < 0.5 || elbow.score < 0.5 || wrist.score < 0.5) {
            return 0;
        }

        const radians =
            Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) -
            Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
        let angle = (radians * 180.0) / Math.PI;
        return Math.abs(angle);
    };

    const drawSkeleton = (ctx, keypoints, video) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.font = "16px Arial";
        ctx.fillStyle = "yellow";

        const connections = [
            [5, 7], [7, 9], [6, 8], [8, 10],
            [5, 6], [11, 12], [5, 11], [6, 12]
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

        // Display elbow angle
        const leftElbow = keypoints[7];
        if (leftElbow && leftElbow.score > 0.5) {
            ctx.fillText(`${elbowAngle.toFixed(2)}°`, leftElbow.x + 10, leftElbow.y - 10);
        }
    };

    const loadModel = async () => {
        try {
            await tf.setBackend("webgl");
            const detector = await posedetection.createDetector(
                posedetection.SupportedModels.MoveNet,
                { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
            );
            return detector;
        } catch (error) {
            console.error("Error loading model:", error);
            return null;
        }
    };

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

    const detectPose = async (detector) => {
        if (videoRef.current.readyState === 4) {
            const poses = await detector.estimatePoses(videoRef.current);

            if (poses.length > 0) {
                const keypoints = poses[0].keypoints;
                drawSkeleton(canvasRef.current.getContext("2d"), keypoints, videoRef.current);

                const leftShoulder = keypoints[5];
                const leftElbow = keypoints[7];
                const leftWrist = keypoints[9];

                if (leftShoulder && leftElbow && leftWrist) {
                    const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
                    setElbowAngle(angle);

                    console.log("Elbow Angle:", angle, "Press State:", pressState.current);

                    // Shoulder press rep-counting logic
                    if (pressState.current === "DOWN" && angle > 160) {
                        pressState.current = "UP";
                        console.log("State Changed: UP");
                    } else if (pressState.current === "UP" && angle < 90) {
                        if (Date.now() - lastRepTime.current > 1000) { // 1 sec debounce
                            repsRef.current += 1;
                            setReps(repsRef.current);
                            pressState.current = "DOWN";
                            lastRepTime.current = Date.now();
                            console.log("Rep Counted! New Reps:", repsRef.current);
                        }
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
            <h1>Shoulder Press Counter</h1>
            <h2>Reps: {reps}</h2>
            <h3>Elbow Angle: {elbowAngle.toFixed(2)}°</h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: "400px", border: "2px solid white" }} />
                <canvas ref={canvasRef} width={400} height={400} style={{ border: "2px solid white" }} />
            </div>
        </div>
    );
};

export default App;

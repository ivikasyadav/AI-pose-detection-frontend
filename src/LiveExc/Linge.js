import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

const App = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [reps, setReps] = useState(0);
    const [kneeAngle, setKneeAngle] = useState(0);
    const lungeState = useRef("UP"); // Track state without re-renders
    const repsRef = useRef(0);
    const lastRepTime = useRef(0);

    const calculateAngle = (hip, knee, ankle) => {
        if (hip.score < 0.5 || knee.score < 0.5 || ankle.score < 0.5) {
            return 0;
        }

        const radians =
            Math.atan2(ankle.y - knee.y, ankle.x - knee.x) -
            Math.atan2(hip.y - knee.y, hip.x - knee.x);
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
            [11, 13], [13, 15], [12, 14], [14, 16], // Legs
            [5, 7], [7, 9], [6, 8], [8, 10], // Arms
            [5, 6], [11, 12], [5, 11], [6, 12] // Torso
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

        // Display knee angle
        const leftKnee = keypoints[13];
        if (leftKnee && leftKnee.score > 0.5) {
            ctx.fillText(`${kneeAngle.toFixed(2)}°`, leftKnee.x + 10, leftKnee.y - 10);
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
        if (!videoRef.current || videoRef.current.readyState !== 4) {
            requestAnimationFrame(() => detectPose(detector)); // Retry on next frame
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

                console.log("Knee Angle:", angle, "Lunge State:", lungeState.current);

                if (lungeState.current === "UP" && angle < 80) {
                    lungeState.current = "DOWN";
                } else if (lungeState.current === "DOWN" && angle > 160) {
                    if (Date.now() - lastRepTime.current > 1000) {
                        repsRef.current += 0.5;
                        setReps(repsRef.current);
                        lungeState.current = "UP";
                        lastRepTime.current = Date.now();
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
            <h1>Lunges Counter</h1>
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

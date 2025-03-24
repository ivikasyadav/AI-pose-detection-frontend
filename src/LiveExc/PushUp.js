import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

const PushUpCounter = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [reps, setReps] = useState(0);
    const pushUpState = useRef("UP"); // Track push-up state
    const repsRef = useRef(0); // Track reps
    const lastRepTime = useRef(0); // Prevents double counting

    const drawSkeleton = (ctx, keypoints, video) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.font = "16px Arial";
        ctx.fillStyle = "yellow";

        const connections = [
            [5, 7], [7, 9], [6, 8], [8, 10], // Arms
            [5, 6], [11, 12], [5, 11], [6, 12], // Shoulders & torso
            [11, 13], [13, 15], [12, 14], [14, 16] // Legs
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
                ctx.fillStyle = "red"
                ctx.fill();
            }
        });
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
            requestAnimationFrame(() => detectPose(detector));
            return;
        }

        const poses = await detector.estimatePoses(videoRef.current);

        if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            drawSkeleton(canvasRef.current.getContext("2d"), keypoints, videoRef.current);

            const leftShoulder = keypoints[5];
            const rightShoulder = keypoints[6];
            const leftHip = keypoints[11];
            const rightHip = keypoints[12];
            const leftKnee = keypoints[13];
            const rightKnee = keypoints[14];

            if (leftShoulder && rightShoulder && leftHip && rightHip && leftKnee && rightKnee) {
                // Average the shoulder and hip y-coordinates
                const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
                const avgHipY = (leftHip.y + rightHip.y) / 2;
                const avgKneeY = (leftKnee.y + rightKnee.y) / 2;

                console.log(`Shoulders: ${avgShoulderY}, Hips: ${avgHipY}, Knees: ${avgKneeY}`);

                // Detect push-up motion
                if (pushUpState.current === "UP" && avgShoulderY > avgHipY + 50) {
                    pushUpState.current = "DOWN"; // Push-up is at the bottom position
                    console.log("Push-Up Down");
                } else if (pushUpState.current === "DOWN" && avgShoulderY < avgHipY - 50) {
                    // Ensure reps are only counted once per cycle
                    if (Date.now() - lastRepTime.current > 1000) { // 1 sec debounce
                        repsRef.current += 1;
                        setReps(repsRef.current);
                        pushUpState.current = "UP"; // Reset state
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
            <h1>Push-Up Counter</h1>
            <h2>Reps: {reps}</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: "400px", border: "2px solid white" }} />
                <canvas ref={canvasRef} width={400} height={400} style={{ border: "2px solid white" }} />
            </div>
        </div>
    );
};

export default PushUpCounter;

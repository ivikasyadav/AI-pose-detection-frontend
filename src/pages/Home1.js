import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css"; // Import the CSS file  
import Biceps from '../images/Biceps_curl.jpg';
import Pushup from '../images/Push_up.jpg';
import Squats from '../images/Squats.jpg';
import Lunges from '../images/Lunges.jpg';
import Shoulder from '../images/Press.jpg';

const exercises = [
    { name: "Biceps Curl", image: Biceps, page: "/page1" },
    { name: "Push-Up", image: Pushup, page: "/page2" },
    { name: "Squat", image: Squats, page: "/page3" },
    { name: "Lunge", image: Lunges, page: "/page4" },
    { name: "Shoulder Press", image: Shoulder, page: "/page5" }
];

const LiveExercises = [
    { name: "Live Biceps Curl", image: Biceps, page: "/page11" },
    { name: "Live Push-Up", image: Pushup, page: "/page7" },
    { name: "Live Squat", image: Squats, page: "/page8" },
    { name: "Live Lunge", image: Lunges, page: "/page9" },
    { name: "Live Shoulder Press", image: Shoulder, page: "/page10" }
];

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1 className="home-title">Choose Your Exercise</h1>
            <div className="exercise-grid">
                {exercises.map((exercise, index) => (
                    <div key={index} className="exercise-card">
                        <img src={exercise.image} alt={exercise.name} />
                        <h3>{exercise.name}</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => navigate(LiveExercises[index].page)}
                                style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' ,marginLeft:'100px'}}
                            >
                                Track Live
                            </button>
                            <button
                                onClick={() => navigate(exercise.page)}
                                style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                            >
                                Go to Exercise
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;

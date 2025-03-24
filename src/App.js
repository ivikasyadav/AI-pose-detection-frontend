// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { io } from 'socket.io-client';
// import Biceps_curl from './Excerise/Biceps_curl';
// import ExerciseTracker from './Excerise/ExerciseTracker ';
// import ExerciseTracke from './Excerise/ExerciseTracke';
// import { Route, Routes } from 'react-router-dom';


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import Navbar from "./com/Navbar";
// import Home from "./pages/Home";
import Home from "./pages/Home1";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Biceps_curl from "./AllExc/Biceps_curl";
import Push_UP from "./AllExc/Push_UP";
import Squates from "./AllExc/Squates";
import Lunges from "./AllExc/Lunges";
import Shoulderpress from "./AllExc/Shoulderpress";
import BC from './AllExc/BC'
import Live from './LiveExc'
import Bicepscurl from '../src/LiveExc/Biceps_curl'
import Lunges1 from '../src/LiveExc/Linge'
import SP from '../src/LiveExc/Shoulder_Press'
import Squats from './LiveExc/Squats'
import Pu from './LiveExc/PushUp'
import EXp from './LiveExc/EXP'


const App = () => {
  

  return (
    <>
    {/* <Biceps_curl/> */}
    {/* <ExerciseTracker/> */}

      {/* <ExerciseTracker exerciseType="biceps-curl" />
      <ExerciseTracker exerciseType="push-up" />
      <ExerciseTracker exerciseType="squat" /> */}
      {/* <ExerciseTracke exerciseType="biceps-curl" />
      <ExerciseTracke exerciseType="push-up" />
      <ExerciseTracke exerciseType="squat" />
      <ExerciseTracke exerciseType="lunge" />
      <ExerciseTracke exerciseType="shoulder-press" /> */}

      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home   />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/page1" element={<Biceps_curl />} />
            {/* <Route path="/page1" element={<BC />} /> */}
            <Route path="/page2" element={<Push_UP />} />
            <Route path="/page3" element={<Squates />} />
            <Route path="/page4" element={<Lunges />} />
            <Route path="/page5" element={<Shoulderpress />} />

            <Route path="/page6" element={<Bicepscurl />} />
            <Route path="/page7" element={<Pu />} />
            <Route path="/page8" element={<Squats />} />
            <Route path="/page9" element={<Lunges1 />} />
            <Route path="/page10" element={<SP />} />
            <Route path="/page11" element={<EXp />} />

            {/* <Route path="/page5" element={< Live/>} /> */}
          </Routes>
        </Router>
      </AuthProvider>
      
    </>
  );
};

export default App;

import React from 'react'
import ExerciseTracke from '../com/ExerciseTracke'

const Home = () => {
    return (
        <>
            <ExerciseTracke exerciseType="biceps-curl" />
            <ExerciseTracke exerciseType="push-up" />
            <ExerciseTracke exerciseType="squat" />
            <ExerciseTracke exerciseType="lunge" />
            <ExerciseTracke exerciseType="shoulder-press" />
        </>
    )
}

export default Home
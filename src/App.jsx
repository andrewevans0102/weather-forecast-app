import React from 'react'
import './App.css'
import WeatherApp from './components/WeatherApp'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>My Weather Dashboard</h1>
      </header>
      <main>
        <WeatherApp />
      </main>
      <footer className="app-footer">
        <p>Created with React and OpenWeatherMap API</p>
      </footer>
    </div>
  )
}

export default App
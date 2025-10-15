import React from 'react'
import Game from './Game'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>🎮 2048 Cube Drop</h1>
        <p className="subtitle">Drop & Merge Cubes!</p>
      </header>
      <Game />
      <footer className="footer">
        <p>Use ← → Arrow Keys to Move | ↓ to Drop Faster | Space to Instant Drop</p>
      </footer>
    </div>
  )
}

export default App

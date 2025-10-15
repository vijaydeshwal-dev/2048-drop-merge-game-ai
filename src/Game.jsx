import React, { useState, useEffect, useCallback, useRef } from 'react'

const GRID_WIDTH = 8
const GRID_HEIGHT = 12
const INITIAL_SPEED = 800
const SPEED_INCREMENT = 0.95

// Cube values for 2048 style game
const CUBE_VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]

// Color mapping for different cube values
const CUBE_COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  4096: '#3c3a32',
}

const TEXT_COLORS = {
  2: '#776e65',
  4: '#776e65',
  8: '#f9f6f2',
  16: '#f9f6f2',
  32: '#f9f6f2',
  64: '#f9f6f2',
  128: '#f9f6f2',
  256: '#f9f6f2',
  512: '#f9f6f2',
  1024: '#f9f6f2',
  2048: '#f9f6f2',
  4096: '#f9f6f2',
}

function Game() {
  const [grid, setGrid] = useState(() => Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)))
  const [currentCube, setCurrentCube] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('cube2048HighScore')
    return saved ? parseInt(saved, 10) : 0
  })
  const [dropSpeed, setDropSpeed] = useState(INITIAL_SPEED)
  const gameLoopRef = useRef(null)

  // Initialize new cube
  const spawnCube = useCallback(() => {
    const value = CUBE_VALUES[Math.floor(Math.random() * Math.min(4, CUBE_VALUES.length))] // Mostly 2, 4, 8, 16
    const x = Math.floor(GRID_WIDTH / 2)
    return { x, y: 0, value }
  }, [])

  // Check if position is valid
  const isValidPosition = useCallback((grid, cube, newX, newY) => {
    if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
      return false
    }
    if (newY >= 0 && grid[newY][newX] !== 0) {
      return false
    }
    return true
  }, [])

  // Merge cubes with same value
  const mergeCubes = useCallback((grid) => {
    let newGrid = grid.map(row => [...row])
    let scoreGain = 0
    let merged = true

    while (merged) {
      merged = false
      // Check from bottom to top
      for (let y = GRID_HEIGHT - 1; y > 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          if (newGrid[y][x] !== 0 && newGrid[y][x] === newGrid[y - 1][x]) {
            // Merge cubes
            newGrid[y][x] *= 2
            newGrid[y - 1][x] = 0
            scoreGain += newGrid[y][x]
            merged = true
          }
        }
      }

      // Apply gravity after merging
      if (merged) {
        newGrid = applyGravity(newGrid)
      }
    }

    return { grid: newGrid, scoreGain }
  }, [])

  // Apply gravity to floating cubes
  const applyGravity = useCallback((grid) => {
    let newGrid = grid.map(row => [...row])
    let moved = true

    while (moved) {
      moved = false
      for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          if (newGrid[y][x] !== 0 && newGrid[y + 1][x] === 0) {
            newGrid[y + 1][x] = newGrid[y][x]
            newGrid[y][x] = 0
            moved = true
          }
        }
      }
    }

    return newGrid
  }, [])

  // Place cube on grid
  const placeCube = useCallback((grid, cube) => {
    const newGrid = grid.map(row => [...row])
    newGrid[cube.y][cube.x] = cube.value
    
    // Apply gravity and merge
    const gravityGrid = applyGravity(newGrid)
    const { grid: mergedGrid, scoreGain } = mergeCubes(gravityGrid)
    
    setScore(prev => {
      const newScore = prev + scoreGain
      if (newScore > highScore) {
        setHighScore(newScore)
        localStorage.setItem('cube2048HighScore', newScore.toString())
      }
      return newScore
    })

    // Increase speed slightly
    setDropSpeed(prev => Math.max(200, prev * SPEED_INCREMENT))

    return mergedGrid
  }, [applyGravity, mergeCubes, highScore])

  // Move cube down
  const moveCubeDown = useCallback(() => {
    if (!currentCube || gameOver || isPaused) return

    const newY = currentCube.y + 1
    if (isValidPosition(grid, currentCube, currentCube.x, newY)) {
      setCurrentCube({ ...currentCube, y: newY })
    } else {
      // Place cube and spawn new one
      const newGrid = placeCube(grid, currentCube)
      setGrid(newGrid)
      
      // Check if game over (top row has cubes)
      if (newGrid[0].some(cell => cell !== 0)) {
        setGameOver(true)
        return
      }
      
      setCurrentCube(spawnCube())
    }
  }, [currentCube, grid, gameOver, isPaused, isValidPosition, placeCube, spawnCube])

  // Move cube horizontally
  const moveCubeHorizontal = useCallback((direction) => {
    if (!currentCube || gameOver || isPaused) return

    const newX = currentCube.x + direction
    if (isValidPosition(grid, currentCube, newX, currentCube.y)) {
      setCurrentCube({ ...currentCube, x: newX })
    }
  }, [currentCube, grid, gameOver, isPaused, isValidPosition])

  // Instant drop
  const instantDrop = useCallback(() => {
    if (!currentCube || gameOver || isPaused) return

    let newY = currentCube.y
    while (isValidPosition(grid, currentCube, currentCube.x, newY + 1)) {
      newY++
    }
    
    const newGrid = placeCube(grid, { ...currentCube, y: newY })
    setGrid(newGrid)
    
    if (newGrid[0].some(cell => cell !== 0)) {
      setGameOver(true)
      return
    }
    
    setCurrentCube(spawnCube())
  }, [currentCube, grid, gameOver, isPaused, isValidPosition, placeCube, spawnCube])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveCubeHorizontal(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveCubeHorizontal(1)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveCubeDown()
          break
        case ' ':
          e.preventDefault()
          instantDrop()
          break
        case 'p':
        case 'P':
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveCubeHorizontal, moveCubeDown, instantDrop, gameOver])

  // Game loop
  useEffect(() => {
    if (!currentCube && !gameOver) {
      setCurrentCube(spawnCube())
    }

    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }

    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        moveCubeDown()
      }, dropSpeed)
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [currentCube, gameOver, isPaused, moveCubeDown, spawnCube, dropSpeed])

  // Restart game
  const restartGame = () => {
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)))
    setCurrentCube(null)
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    setDropSpeed(INITIAL_SPEED)
  }

  // Render cell
  const renderCell = (value, isCurrentCube = false) => {
    if (value === 0) return null

    const bgColor = CUBE_COLORS[value] || CUBE_COLORS[4096]
    const textColor = TEXT_COLORS[value] || TEXT_COLORS[4096]

    return (
      <div
        className={`cube ${isCurrentCube ? 'current-cube' : ''}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {value}
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="score-board">
          <div className="score-item">
            <div className="score-label">Score</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-item">
            <div className="score-label">High Score</div>
            <div className="score-value">{highScore}</div>
          </div>
        </div>
        <button className="restart-button" onClick={restartGame}>
          🔄 New Game
        </button>
      </div>

      <div className="game-board">
        {grid.map((row, y) => (
          <div key={y} className="grid-row">
            {row.map((cell, x) => {
              const isCurrentCubeCell = currentCube && currentCube.x === x && currentCube.y === y
              const displayValue = isCurrentCubeCell ? currentCube.value : cell
              
              return (
                <div key={x} className="grid-cell">
                  {renderCell(displayValue, isCurrentCubeCell)}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>Game Over!</h2>
            <p className="final-score">Final Score: {score}</p>
            {score === highScore && score > 0 && (
              <p className="high-score-badge">🎉 New High Score! 🎉</p>
            )}
            <button className="restart-button large" onClick={restartGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {isPaused && !gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>Paused</h2>
            <p>Press P to resume</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game

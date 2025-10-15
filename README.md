# 🎮 2048 Cube Drop

A fun merge game combining Tetris-style dropping mechanics with 2048-style number merging!

## Features

- 🎯 **Drop & Merge**: Cubes drop from the top, merge when same values touch
- 🌈 **Beautiful UI**: Modern gradient design with smooth animations
- 📊 **Score Tracking**: Keep track of your score and high score
- ⚡ **Progressive Difficulty**: Game speeds up as you play
- 💾 **Persistent High Score**: Your best score is saved locally

## How to Play

### Controls
- **← → Arrow Keys**: Move the falling cube left/right
- **↓ Arrow Key**: Drop faster
- **Space Bar**: Instant drop
- **P Key**: Pause/Resume game

### Rules
1. Cubes with numbers (2, 4, 8, 16, etc.) fall from the top
2. Use arrow keys to position the falling cube
3. When two cubes with the same number touch, they merge into a higher value
4. Gravity applies automatically - cubes fall and merge repeatedly
5. Game ends when cubes stack to the top

### Scoring
- Each merge adds the merged value to your score
- Try to create higher value cubes (2048 and beyond!)
- Beat your high score!

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Then open your browser to the URL shown (usually http://localhost:5173)

### Build for Production
```bash
npm run build
```

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **CSS3**: Styling with animations and gradients

## Game Mechanics

- **8x12 Grid**: Wide play area for strategic moves
- **Auto-Merge**: Cubes automatically merge when matching values touch
- **Gravity System**: Floating cubes fall automatically after merges
- **Chain Reactions**: Multiple merges can occur in sequence

Enjoy the game! 🎉

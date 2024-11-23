# Retro Arcade Collection

A modern React-based collection of classic arcade games, featuring a retro green monochrome aesthetic.

## Games Available

1. **Snake**
   - Classic snake gameplay
   - Grow longer by eating food
   - Avoid walls and self-collision

2. **Tetris**
   - Classic block-stacking puzzle game
   - Clear lines to score points
   - Increasing difficulty

3. **Pong**
   - Two-player classic
   - First to 11 points wins
   - Use W/S and Up/Down arrows

4. **Pac-Man**
   - Navigate the maze
   - Eat dots and avoid ghosts
   - Power pellets turn ghosts blue

5. **Breakout**
   - Classic brick-breaking action
   - Control paddle to bounce ball
   - Break all bricks to win
   - Progressive difficulty

6. **Space Invaders**
   - Defend Earth from alien invasion
   - Shoot down waves of invaders
   - Avoid getting hit
   - Progressive difficulty

## Technology Stack

- React
- TypeScript
- Styled Components
- HTML5 Canvas

## Features

- Responsive design
- Keyboard controls
- High score tracking
- Retro green monochrome aesthetic
- Smooth animations
- Game state management

## Controls

### Snake
- Arrow keys to change direction

### Tetris
- Left/Right: Move piece
- Up: Rotate piece
- Down: Soft drop
- Space: Hard drop

### Pong
- Player 1: W/S keys
- Player 2: Up/Down arrows

### Pac-Man
- Arrow keys to move

### Breakout
- Left/Right arrows to move paddle

### Space Invaders
- Left/Right arrows to move
- Spacebar to shoot

## Development

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
cd games
npm install
```

3. Start development server
```bash
npm start
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
games/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   └── games/
│   │       ├── snake/
│   │       ├── tetris/
│   │       ├── pong/
│   │       ├── pacman/
│   │       ├── breakout/
│   │       └── spaceinvaders/
│   ├── App.tsx
│   └── index.tsx
├── public/
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this code for your own projects!

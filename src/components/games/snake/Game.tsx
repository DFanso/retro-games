import React, { useState, useEffect, useCallback } from 'react';
import { styled } from 'styled-components';
import Board from './Board';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Press Start 2P', cursive;
  color: #00ff00;
  background-color: #000000;
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(transparent 0%, rgba(0, 255, 0, 0.1) 50%, transparent 100%),
      repeating-linear-gradient(
        90deg,
        transparent 0,
        transparent 4px,
        rgba(0, 255, 0, 0.03) 4px,
        rgba(0, 255, 0, 0.03) 8px
      );
    pointer-events: none;
    animation: scan 8s linear infinite;
  }

  @keyframes scan {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 0 100%;
    }
  }
`;

const ScoreBoard = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  text-shadow: 2px 2px #003300;
`;

const Score = styled.div`
  font-size: 24px;
`;

const HighScore = styled.div`
  font-size: 24px;
  color: #ff9900;
`;

const GameOver = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 10;
`;

const GameOverText = styled.div`
  font-size: 48px;
  color: #ff0000;
  text-shadow: 2px 2px #330000;
`;

const RestartButton = styled.button`
  font-family: 'Press Start 2P', cursive;
  font-size: 20px;
  padding: 15px 30px;
  background: #00ff00;
  border: none;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  border-radius: 4px;
  box-shadow: 0 4px 0 #008800;

  &:hover {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #008800;
  }

  &:active {
    transform: translateY(4px);
    box-shadow: none;
  }
`;

type Position = [number, number];
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const BOARD_SIZE = 20;
const INITIAL_SNAKE: Position[] = [[0, 0]];
const INITIAL_FOOD: Position = [
  Math.floor(Math.random() * BOARD_SIZE),
  Math.floor(Math.random() * BOARD_SIZE),
];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

const Game: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = [
        Math.floor(Math.random() * BOARD_SIZE),
        Math.floor(Math.random() * BOARD_SIZE),
      ];
    } while (
      snake.some(([x, y]) => x === newFood[0] && y === newFood[1])
    );
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const head = snake[0];
    let newHead: Position;

    switch (direction) {
      case 'UP':
        newHead = [head[0] - 1, head[1]];
        break;
      case 'DOWN':
        newHead = [head[0] + 1, head[1]];
        break;
      case 'LEFT':
        newHead = [head[0], head[1] - 1];
        break;
      case 'RIGHT':
        newHead = [head[0], head[1] + 1];
        break;
      default:
        return;
    }

    // Check collision with walls
    if (
      newHead[0] < 0 ||
      newHead[0] >= BOARD_SIZE ||
      newHead[1] < 0 ||
      newHead[1] >= BOARD_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (snake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead];
    const eating = newHead[0] === food[0] && newHead[1] === food[1];

    if (eating) {
      const newScore = score + 10;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('snakeHighScore', newScore.toString());
      }
      generateFood();
    }

    // Add rest of the snake body
    newSnake.push(...snake.slice(0, eating ? snake.length : snake.length - 1));
    setSnake(newSnake);
  }, [snake, direction, food, gameOver, generateFood, score, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent scrolling when using arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === 'Enter' && gameOver) {
        resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  return (
    <GameWrapper>
      <ScoreBoard>
        <Score>Score: {score}</Score>
        <HighScore>High Score: {highScore}</HighScore>
      </ScoreBoard>
      <Board
        snakeBody={snake}
        food={food}
        boardSize={BOARD_SIZE}
      />
      {gameOver && (
        <GameOver>
          <GameOverText>GAME OVER!</GameOverText>
          <RestartButton onClick={resetGame}>
            Restart
          </RestartButton>
        </GameOver>
      )}
    </GameWrapper>
  );
};

export default Game;

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// Game Constants
const CELL_SIZE = 20;
const GRID_WIDTH = 28;
const GRID_HEIGHT = 31;
const GHOST_SPEED = 200;

type Direction = 'up' | 'down' | 'left' | 'right';
type CellType = 'wall' | 'dot' | 'powerPellet' | 'empty';
type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  type: GhostType;
  position: Position;
  direction: Direction;
  isVulnerable: boolean;
}

// Styled Components
const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: black;
  min-height: 100vh;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_WIDTH}, ${CELL_SIZE}px);
  grid-template-rows: repeat(${GRID_HEIGHT}, ${CELL_SIZE}px);
  background-color: black;
  border: 2px solid #2121ff;
`;

const Cell = styled.div<{ type: CellType }>`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: ${props => props.type === 'wall' ? '#2121ff' : 'black'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${props => props.type === 'dot' ? '4px' : props.type === 'powerPellet' ? '12px' : '0'};
    height: ${props => props.type === 'dot' ? '4px' : props.type === 'powerPellet' ? '12px' : '0'};
    background-color: ${props => props.type === 'powerPellet' ? '#ffb8ff' : '#ffff00'};
    border-radius: 50%;
  }
`;

const PacMan = styled.div<{ direction: Direction }>`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: #ffff00;
  border-radius: 50%;
  position: absolute;
`;

const Ghost = styled.div<{ type: GhostType; isVulnerable: boolean }>`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: ${props => 
    props.isVulnerable 
      ? '#2121ff'
      : props.type === 'blinky' 
        ? '#ff0000'
        : props.type === 'pinky'
          ? '#ffb8ff'
          : props.type === 'inky'
            ? '#00ffff'
            : '#ffb852'
  };
  border-radius: 50% 50% 0 0;
  position: absolute;
`;

const Score = styled.div`
  font-size: 24px;
  color: white;
  margin: 20px 0;
`;

// Initial game state
const createInitialBoard = (): CellType[][] => {
  const board: CellType[][] = Array(GRID_HEIGHT).fill(null).map(() => 
    Array(GRID_WIDTH).fill('dot')
  );

  // Add walls
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (y === 0 || y === GRID_HEIGHT - 1 || x === 0 || x === GRID_WIDTH - 1) {
        board[y][x] = 'wall';
      }
    }
  }

  // Add power pellets
  board[1][1] = 'powerPellet';
  board[1][GRID_WIDTH - 2] = 'powerPellet';
  board[GRID_HEIGHT - 2][1] = 'powerPellet';
  board[GRID_HEIGHT - 2][GRID_WIDTH - 2] = 'powerPellet';

  return board;
};

const initialGhosts: Ghost[] = [
  { type: 'blinky', position: { x: 13, y: 11 }, direction: 'right', isVulnerable: false },
  { type: 'pinky', position: { x: 14, y: 11 }, direction: 'left', isVulnerable: false },
  { type: 'inky', position: { x: 13, y: 12 }, direction: 'up', isVulnerable: false },
  { type: 'clyde', position: { x: 14, y: 12 }, direction: 'down', isVulnerable: false }
];

const Pacman: React.FC = () => {
  const [board, setBoard] = useState<CellType[][]>(createInitialBoard());
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 14, y: 23 });
  const [pacmanDir, setPacmanDir] = useState<Direction>('right');
  const [ghosts, setGhosts] = useState<Ghost[]>(initialGhosts);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [powerMode, setPowerMode] = useState(false);

  const moveGhosts = useCallback(() => {
    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => {
        const newGhost = { ...ghost };
        const possibleDirections: Direction[] = ['up', 'down', 'left', 'right'];
        const validMoves = possibleDirections.filter(dir => {
          const newPos = { ...ghost.position };
          switch (dir) {
            case 'up':
              newPos.y--;
              break;
            case 'down':
              newPos.y++;
              break;
            case 'left':
              newPos.x--;
              break;
            case 'right':
              newPos.x++;
              break;
          }
          return board[newPos.y]?.[newPos.x] !== 'wall';
        });

        if (validMoves.length > 0) {
          const newDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
          newGhost.direction = newDirection;

          switch (newDirection) {
            case 'up':
              newGhost.position.y--;
              break;
            case 'down':
              newGhost.position.y++;
              break;
            case 'left':
              newGhost.position.x--;
              break;
            case 'right':
              newGhost.position.x++;
              break;
          }
        }

        return newGhost;
      })
    );
  }, [board]);

  const checkCollision = useCallback(() => {
    ghosts.forEach(ghost => {
      if (ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y) {
        if (powerMode && ghost.isVulnerable) {
          setScore(prev => prev + 200);
          setGhosts(prev => prev.map(g => 
            g.type === ghost.type 
              ? { ...g, position: { x: 14, y: 11 } }
              : g
          ));
        } else {
          setGameOver(true);
        }
      }
    });
  }, [ghosts, pacmanPos, powerMode]);

  const movePacman = useCallback((direction: Direction) => {
    setPacmanPos(prev => {
      const newPos = { ...prev };
      switch (direction) {
        case 'up':
          if (board[prev.y - 1]?.[prev.x] !== 'wall') newPos.y--;
          break;
        case 'down':
          if (board[prev.y + 1]?.[prev.x] !== 'wall') newPos.y++;
          break;
        case 'left':
          if (board[prev.y]?.[prev.x - 1] !== 'wall') newPos.x--;
          break;
        case 'right':
          if (board[prev.y]?.[prev.x + 1] !== 'wall') newPos.x++;
          break;
      }
      return newPos;
    });
    setPacmanDir(direction);
  }, [board]);

  const eatDot = useCallback((x: number, y: number) => {
    if (board[y]?.[x] === 'dot') {
      setScore(prev => prev + 10);
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[y][x] = 'empty';
        return newBoard;
      });
    } else if (board[y]?.[x] === 'powerPellet') {
      setScore(prev => prev + 50);
      setPowerMode(true);
      setTimeout(() => setPowerMode(false), 10000);
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[y][x] = 'empty';
        return newBoard;
      });
      setGhosts(prev => prev.map(ghost => ({ ...ghost, isVulnerable: true })));
    }
  }, [board]);

  useEffect(() => {
    if (gameOver) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          movePacman('up');
          break;
        case 'ArrowDown':
          movePacman('down');
          break;
        case 'ArrowLeft':
          movePacman('left');
          break;
        case 'ArrowRight':
          movePacman('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, movePacman]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      moveGhosts();
      checkCollision();
      eatDot(pacmanPos.x, pacmanPos.y);
    }, GHOST_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameOver, moveGhosts, checkCollision, eatDot, pacmanPos]);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setPacmanPos({ x: 14, y: 23 });
    setPacmanDir('right');
    setGhosts(initialGhosts);
    setScore(0);
    setGameOver(false);
    setPowerMode(false);
  };

  return (
    <GameWrapper>
      <Score>Score: {score}</Score>
      <GameBoard>
        {board.map((row, y) =>
          row.map((cell, x) => (
            <Cell key={`${x}-${y}`} type={cell} />
          ))
        )}
        <PacMan
          style={{
            left: `${pacmanPos.x * CELL_SIZE}px`,
            top: `${pacmanPos.y * CELL_SIZE}px`
          }}
          direction={pacmanDir}
        />
        {ghosts.map((ghost) => (
          <Ghost
            key={ghost.type}
            type={ghost.type}
            isVulnerable={ghost.isVulnerable && powerMode}
            style={{
              left: `${ghost.position.x * CELL_SIZE}px`,
              top: `${ghost.position.y * CELL_SIZE}px`
            }}
          />
        ))}
      </GameBoard>
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </GameWrapper>
  );
};

export default Pacman;

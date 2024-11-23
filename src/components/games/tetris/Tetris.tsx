import React, { useState, useEffect, useCallback } from 'react';
import { styled } from 'styled-components';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;

type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface Tetromino {
  shape: number[][];
  color: string;
}

const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f0f0'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#f0a000'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#a000f0'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#f00000'
  }
};

interface Position {
  x: number;
  y: number;
}

interface TetrisState {
  piece: TetrominoType;
  shape: number[][];
}

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
    from { background-position: 0 0; }
    to { background-position: 0 100%; }
  }
`;

const BoardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(${BOARD_WIDTH}, 30px);
  grid-template-rows: repeat(${BOARD_HEIGHT}, 30px);
  gap: 1px;
  background-color: #1a1a1a;
  padding: 10px;
  border-radius: 4px;
  border: 2px solid #4a4a4a;
`;

const Cell = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  background-color: ${props => props.color || '#000'};
  border: ${props => props.color ? '1px solid rgba(255,255,255,0.1)' : 'none'};
  border-radius: 2px;
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

const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill(''));

const getRandomTetromino = (): TetrominoType => {
  const pieces = Object.keys(TETROMINOES) as TetrominoType[];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<TetrisState>({
    piece: getRandomTetromino(),
    shape: TETROMINOES[getRandomTetromino()].shape
  });
  const [position, setPosition] = useState<Position>({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState<number | null>(INITIAL_DROP_TIME);

  const rotate = useCallback((matrix: number[][]) => {
    const N = matrix.length;
    const rotated = matrix.map((row, i) => 
      matrix.map(col => col[N - 1 - i])
    );
    return rotated;
  }, []);

  const isValidMove = useCallback((pos: Position, piece: TetrominoType, shape: number[][] = currentPiece.shape) => {
    return shape.every((row, dy) =>
      row.every((value, dx) => {
        if (!value) return true;
        const newX = pos.x + dx;
        const newY = pos.y + dy;
        return (
          newX >= 0 &&
          newX < BOARD_WIDTH &&
          newY < BOARD_HEIGHT &&
          (newY < 0 || board[newY][newX] === '')
        );
      })
    );
  }, [board]);

  const merge = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const newY = position.y + y;
          if (newY >= 0) {
            newBoard[newY][position.x + x] = TETROMINOES[currentPiece.piece].color;
          }
        }
      });
    });

    return newBoard;
  }, [board, currentPiece, position]);

  const clearLines = useCallback((newBoard: string[][]) => {
    let linesCleared = 0;
    const clearedBoard = newBoard.reduce((acc, row) => {
      if (row.every(cell => cell !== '')) {
        linesCleared++;
        acc.unshift(Array(BOARD_WIDTH).fill(''));
      } else {
        acc.push(row);
      }
      return acc;
    }, [] as string[][]);

    if (linesCleared > 0) {
      const points = [40, 100, 300, 1200][linesCleared - 1];
      setScore(prev => {
        const newScore = prev + points;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('tetrisHighScore', newScore.toString());
        }
        return newScore;
      });
    }

    return clearedBoard;
  }, [highScore]);

  const drop = useCallback(() => {
    const newPos = { ...position, y: position.y + 1 };
    if (isValidMove(newPos, currentPiece.piece)) {
      setPosition(newPos);
    } else {
      if (position.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      const newBoard = merge();
      setBoard(clearLines(newBoard));
      const newPiece = getRandomTetromino();
      setCurrentPiece({
        piece: newPiece,
        shape: TETROMINOES[newPiece].shape
      });
      setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  }, [position, currentPiece, isValidMove, merge, clearLines]);

  const move = useCallback((dir: number) => {
    const newPos = { ...position, x: position.x + dir };
    if (isValidMove(newPos, currentPiece.piece)) {
      setPosition(newPos);
    }
  }, [position, currentPiece, isValidMove]);

  const rotatePiece = useCallback(() => {
    const rotated = rotate(currentPiece.shape);
    if (isValidMove(position, currentPiece.piece, rotated)) {
      setCurrentPiece(prev => ({
        piece: prev.piece,
        shape: rotated
      }));
    }
  }, [position, currentPiece, rotate, isValidMove]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    const newPiece = getRandomTetromino();
    setCurrentPiece({
      piece: newPiece,
      shape: TETROMINOES[newPiece].shape
    });
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setDropTime(INITIAL_DROP_TIME);
  }, []);

  useEffect(() => {
    if (!gameOver && dropTime) {
      const timer = setInterval(drop, dropTime);
      return () => clearInterval(timer);
    }
  }, [drop, gameOver, dropTime]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === 'Enter') {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          move(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          move(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          drop();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          setDropTime(prev => prev ? null : INITIAL_DROP_TIME);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, resetGame, move, drop, rotatePiece]);

  const displayBoard = board.map((row, i) => {
    return row.map((cell, j) => {
      let color = cell;
      if (!gameOver) {
        currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (
              value &&
              i === position.y + y &&
              j === position.x + x &&
              position.y + y >= 0
            ) {
              color = TETROMINOES[currentPiece.piece].color;
            }
          });
        });
      }
      return color;
    });
  });

  return (
    <GameWrapper>
      <ScoreBoard>
        <Score>Score: {score}</Score>
        <HighScore>High Score: {highScore}</HighScore>
      </ScoreBoard>
      <BoardWrapper>
        {displayBoard.map((row, i) =>
          row.map((cell, j) => (
            <Cell key={`${i}-${j}`} color={cell} />
          ))
        )}
      </BoardWrapper>
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

export default Tetris;

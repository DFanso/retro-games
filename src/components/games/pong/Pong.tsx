import React, { useState, useEffect, useCallback } from 'react';
import { styled } from 'styled-components';

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 15;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;

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

const GameBoard = styled.div`
  width: ${GAME_WIDTH}px;
  height: ${GAME_HEIGHT}px;
  background-color: #000;
  border: 2px solid #00ff00;
  position: relative;
  overflow: hidden;
`;

const Paddle = styled.div<{ position: number; isLeft: boolean }>`
  width: ${PADDLE_WIDTH}px;
  height: ${PADDLE_HEIGHT}px;
  background-color: #00ff00;
  position: absolute;
  left: ${props => props.isLeft ? '20px' : `${GAME_WIDTH - PADDLE_WIDTH - 20}px`};
  top: ${props => props.position}px;
  transition: top 0.05s linear;
`;

const Ball = styled.div<{ x: number; y: number }>`
  width: ${BALL_SIZE}px;
  height: ${BALL_SIZE}px;
  background-color: #00ff00;
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  border-radius: 50%;
`;

const ScoreBoard = styled.div`
  display: flex;
  gap: 100px;
  margin-bottom: 20px;
  font-size: 32px;
  text-shadow: 2px 2px #003300;
`;

const Score = styled.div``;

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
  color: #00ff00;
  text-shadow: 2px 2px #003300;
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

const Pong: React.FC = () => {
  const [leftPaddle, setLeftPaddle] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddle, setRightPaddle] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [ballSpeed, setBallSpeed] = useState({ x: INITIAL_BALL_SPEED, y: INITIAL_BALL_SPEED });
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'left' | 'right' | null>(null);

  const resetBall = useCallback(() => {
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    setBallSpeed({
      x: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      y: INITIAL_BALL_SPEED * (Math.random() * 2 - 1)
    });
  }, []);

  const resetGame = useCallback(() => {
    setLeftPaddle(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setRightPaddle(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setLeftScore(0);
    setRightScore(0);
    setGameOver(false);
    setWinner(null);
    resetBall();
  }, [resetBall]);

  const movePaddle = useCallback((paddle: 'left' | 'right', direction: 'up' | 'down') => {
    const setPaddle = paddle === 'left' ? setLeftPaddle : setRightPaddle;
    const currentPosition = paddle === 'left' ? leftPaddle : rightPaddle;
    
    setPaddle(prev => {
      const newPosition = prev + (direction === 'up' ? -PADDLE_SPEED : PADDLE_SPEED);
      return Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newPosition));
    });
  }, [leftPaddle, rightPaddle]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      if (gameOver) {
        if (e.key === 'Enter') {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case 'w':
          movePaddle('left', 'up');
          break;
        case 's':
          movePaddle('left', 'down');
          break;
        case 'ArrowUp':
          movePaddle('right', 'up');
          break;
        case 'ArrowDown':
          movePaddle('right', 'down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, resetGame, movePaddle]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setBall(prevBall => {
        const newBall = {
          x: prevBall.x + ballSpeed.x,
          y: prevBall.y + ballSpeed.y
        };

        // Wall collisions
        if (newBall.y <= 0 || newBall.y >= GAME_HEIGHT - BALL_SIZE) {
          setBallSpeed(prev => ({ ...prev, y: -prev.y }));
        }

        // Paddle collisions
        if (
          newBall.x <= PADDLE_WIDTH + 20 &&
          newBall.y + BALL_SIZE >= leftPaddle &&
          newBall.y <= leftPaddle + PADDLE_HEIGHT
        ) {
          const relativeIntersectY = (leftPaddle + (PADDLE_HEIGHT / 2)) - newBall.y;
          const normalizedRelativeIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
          const bounceAngle = normalizedRelativeIntersectY * Math.PI / 4;

          setBallSpeed({
            x: INITIAL_BALL_SPEED * Math.cos(bounceAngle),
            y: -INITIAL_BALL_SPEED * Math.sin(bounceAngle)
          });
        }

        if (
          newBall.x >= GAME_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE &&
          newBall.y + BALL_SIZE >= rightPaddle &&
          newBall.y <= rightPaddle + PADDLE_HEIGHT
        ) {
          const relativeIntersectY = (rightPaddle + (PADDLE_HEIGHT / 2)) - newBall.y;
          const normalizedRelativeIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
          const bounceAngle = normalizedRelativeIntersectY * Math.PI / 4;

          setBallSpeed({
            x: -INITIAL_BALL_SPEED * Math.cos(bounceAngle),
            y: -INITIAL_BALL_SPEED * Math.sin(bounceAngle)
          });
        }

        // Scoring
        if (newBall.x <= 0) {
          setRightScore(prev => {
            const newScore = prev + 1;
            if (newScore >= 11) {
              setGameOver(true);
              setWinner('right');
            }
            return newScore;
          });
          resetBall();
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
        }

        if (newBall.x >= GAME_WIDTH - BALL_SIZE) {
          setLeftScore(prev => {
            const newScore = prev + 1;
            if (newScore >= 11) {
              setGameOver(true);
              setWinner('left');
            }
            return newScore;
          });
          resetBall();
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
        }

        return newBall;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameOver, ballSpeed, leftPaddle, rightPaddle, resetBall]);

  return (
    <GameWrapper>
      <ScoreBoard>
        <Score>{leftScore}</Score>
        <Score>{rightScore}</Score>
      </ScoreBoard>
      <GameBoard>
        <Paddle position={leftPaddle} isLeft={true} />
        <Paddle position={rightPaddle} isLeft={false} />
        <Ball x={ball.x} y={ball.y} />
        {gameOver && (
          <GameOver>
            <GameOverText>
              {winner === 'left' ? 'LEFT' : 'RIGHT'} PLAYER WINS!
            </GameOverText>
            <RestartButton onClick={resetGame}>
              Play Again
            </RestartButton>
          </GameOver>
        )}
      </GameBoard>
    </GameWrapper>
  );
};

export default Pong;

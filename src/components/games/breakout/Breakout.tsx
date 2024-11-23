import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_SIZE = 10;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 10;
const INITIAL_BALL_SPEED = 3;
const MAX_BALL_SPEED = 6;
const SPEED_INCREMENT = 0.0005;

// Styled Components
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #000;
  padding: 20px;
  min-height: 100vh;
`;

const Canvas = styled.canvas`
  border: 2px solid #00ff00;
  background-color: #000;
`;

const Score = styled.div`
  color: #00ff00;
  font-size: 24px;
  margin: 20px 0;
  font-family: 'Press Start 2P', monospace;
`;

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  isVisible: boolean;
}

const Breakout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(INITIAL_BALL_SPEED);
  const [paddle, setPaddle] = useState({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
  });
  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    dx: INITIAL_BALL_SPEED,
    dy: -INITIAL_BALL_SPEED,
  });
  const [bricks, setBricks] = useState<Brick[]>([]);

  // Initialize bricks
  useEffect(() => {
    const newBricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLUMNS; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          isVisible: true,
        });
      }
    }
    setBricks(newBricks);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw paddle
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
      ctx.closePath();

      // Draw bricks
      bricks.forEach((brick) => {
        if (brick.isVisible) {
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
      });

      // Update ball position
      setBall((prevBall) => {
        let newBall = { ...prevBall };
        
        // Gradually increase speed up to max speed
        setCurrentSpeed(prevSpeed => 
          Math.min(MAX_BALL_SPEED, prevSpeed + SPEED_INCREMENT)
        );

        // Normalize the ball direction and apply current speed
        const magnitude = Math.sqrt(newBall.dx * newBall.dx + newBall.dy * newBall.dy);
        newBall.dx = (newBall.dx / magnitude) * currentSpeed;
        newBall.dy = (newBall.dy / magnitude) * currentSpeed;

        // Wall collisions
        if (newBall.x + BALL_SIZE > CANVAS_WIDTH || newBall.x - BALL_SIZE < 0) {
          newBall.dx = -newBall.dx;
        }
        if (newBall.y - BALL_SIZE < 0) {
          newBall.dy = -newBall.dy;
        }

        // Paddle collision
        if (
          newBall.y + BALL_SIZE > paddle.y &&
          newBall.x > paddle.x &&
          newBall.x < paddle.x + PADDLE_WIDTH &&
          newBall.dy > 0 // Only bounce when ball is moving downward
        ) {
          // Calculate angle based on where the ball hits the paddle
          const hitPosition = (newBall.x - paddle.x) / PADDLE_WIDTH;
          const angle = (hitPosition - 0.5) * Math.PI / 3; // Maximum 60-degree angle
          
          // Set new direction based on angle, maintaining current speed
          newBall.dx = Math.sin(angle) * currentSpeed;
          newBall.dy = -Math.cos(angle) * currentSpeed;
        }

        // Game over
        if (newBall.y + BALL_SIZE > CANVAS_HEIGHT) {
          setGameOver(true);
          return prevBall;
        }

        // Brick collisions
        bricks.forEach((brick, index) => {
          if (brick.isVisible) {
            if (
              newBall.x > brick.x &&
              newBall.x < brick.x + brick.width &&
              newBall.y > brick.y &&
              newBall.y < brick.y + brick.height
            ) {
              newBall.dy = -newBall.dy;
              setBricks((prevBricks) => {
                const newBricks = [...prevBricks];
                newBricks[index] = { ...brick, isVisible: false };
                return newBricks;
              });
              setScore((prevScore) => prevScore + 10);
            }
          }
        });

        return {
          ...newBall,
          x: newBall.x + newBall.dx,
          y: newBall.y + newBall.dy,
        };
      });

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [paddle, bricks, gameOver, currentSpeed]);

  // Handle paddle movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      if (x >= 0 && x <= CANVAS_WIDTH - PADDLE_WIDTH) {
        setPaddle((prevPaddle) => ({
          ...prevPaddle,
          x: x,
        }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setCurrentSpeed(INITIAL_BALL_SPEED);
    setPaddle({
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 40,
    });
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      dx: INITIAL_BALL_SPEED,
      dy: -INITIAL_BALL_SPEED,
    });
    setBricks((prevBricks) =>
      prevBricks.map((brick) => ({ ...brick, isVisible: true }))
    );
  };

  return (
    <GameContainer>
      <Score>Score: {score}</Score>
      <Canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      {gameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ color: '#00ff00', fontSize: '32px', marginBottom: '20px' }}>Game Over!</div>
          <button
            onClick={resetGame}
            style={{
              backgroundColor: '#000',
              color: '#00ff00',
              border: '2px solid #00ff00',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </GameContainer>
  );
};

export default Breakout;

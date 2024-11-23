import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 30;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 15;
const INVADER_WIDTH = 40;
const INVADER_HEIGHT = 30;
const INVADER_ROWS = 5;
const INVADER_COLUMNS = 10;
const INVADER_SPACING = 20;
const INVADER_SPEED = 1;
const BULLET_SPEED = 5;
const PLAYER_SPEED = 5;
const INVADER_DROP_DISTANCE = 30;
const MOVE_INTERVAL = 800; // ms between invader movements

// Types
interface Bullet {
  x: number;
  y: number;
  active: boolean;
}

interface Invader {
  x: number;
  y: number;
  alive: boolean;
}

// Styled Components
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #000;
  padding: 20px;
  min-height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Canvas = styled.canvas`
  border: 2px solid #00ff00;
  background-color: #000;
`;

const Score = styled.div`
  color: #00ff00;
  font-size: 24px;
  margin: 20px 0;
  font-family: 'Courier New', Courier, monospace;
`;

const GameOverText = styled.div`
  color: #00ff00;
  font-size: 48px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Courier New', Courier, monospace;
`;

const SpaceInvaders: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [lastInvaderMove, setLastInvaderMove] = useState(0);
  const [player, setPlayer] = useState({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
  });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [invaderDirection, setInvaderDirection] = useState(1);
  const [lastShot, setLastShot] = useState(0);
  const [invaders, setInvaders] = useState<Invader[]>(() => {
    const invaders: Invader[] = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLUMNS; col++) {
        invaders.push({
          x: col * (INVADER_WIDTH + INVADER_SPACING) + INVADER_SPACING,
          y: row * (INVADER_HEIGHT + INVADER_SPACING) + INVADER_SPACING + 50,
          alive: true,
        });
      }
    }
    return invaders;
  });

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Save high score when game ends
    if (gameOver || gameWon) {
      const currentHighScore = localStorage.getItem('spaceInvadersHighScore') || '0';
      if (score > parseInt(currentHighScore)) {
        localStorage.setItem('spaceInvadersHighScore', score.toString());
      }
    }
  }, [gameOver, gameWon, score]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (gameOver || gameWon) {
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw player
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(player.x + PLAYER_WIDTH / 2, player.y);
      ctx.lineTo(player.x, player.y + PLAYER_HEIGHT);
      ctx.lineTo(player.x + PLAYER_WIDTH, player.y + PLAYER_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw bullets
      ctx.fillStyle = '#00ff00';
      bullets.forEach((bullet) => {
        if (bullet.active) {
          ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
        }
      });

      // Draw invaders
      invaders.forEach((invader) => {
        if (invader.alive) {
          ctx.fillStyle = '#00ff00';
          // Draw invader body
          ctx.fillRect(invader.x, invader.y, INVADER_WIDTH, INVADER_HEIGHT);
          // Draw eyes (empty spaces)
          ctx.clearRect(invader.x + 8, invader.y + 8, 6, 6);
          ctx.clearRect(invader.x + INVADER_WIDTH - 14, invader.y + 8, 6, 6);
        }
      });

      // Update invader positions
      if (timestamp - lastInvaderMove >= MOVE_INTERVAL) {
        let shouldChangeDirection = false;
        let lowestInvader = 0;

        setInvaders((prevInvaders) => {
          const newInvaders = prevInvaders.map((invader) => {
            if (!invader.alive) return invader;

            const newX = invader.x + INVADER_SPEED * invaderDirection;
            if (invader.alive) {
              lowestInvader = Math.max(lowestInvader, invader.y);
              if (newX <= 0 || newX + INVADER_WIDTH >= CANVAS_WIDTH) {
                shouldChangeDirection = true;
              }
            }

            return {
              ...invader,
              x: newX,
            };
          });

          // Check if invaders have reached the bottom
          if (lowestInvader + INVADER_HEIGHT >= player.y) {
            setGameOver(true);
          }

          return newInvaders;
        });

        if (shouldChangeDirection) {
          setInvaderDirection((prev) => -prev);
          setInvaders((prevInvaders) =>
            prevInvaders.map((invader) => ({
              ...invader,
              y: invader.y + INVADER_DROP_DISTANCE,
            }))
          );
        }

        setLastInvaderMove(timestamp);
      }

      // Update bullets and check collisions
      setBullets((prevBullets) =>
        prevBullets
          .filter((bullet) => bullet.active)
          .map((bullet) => {
            const newY = bullet.y - BULLET_SPEED;
            let bulletActive = bullet.active && newY > 0;

            // Check collisions with invaders
            invaders.forEach((invader, index) => {
              if (
                invader.alive &&
                bullet.x >= invader.x &&
                bullet.x <= invader.x + INVADER_WIDTH &&
                newY >= invader.y &&
                newY <= invader.y + INVADER_HEIGHT
              ) {
                setInvaders((prev) => {
                  const newInvaders = [...prev];
                  newInvaders[index] = { ...invader, alive: false };
                  return newInvaders;
                });
                setScore((prev) => prev + 10);
                bulletActive = false;
              }
            });

            return {
              ...bullet,
              y: newY,
              active: bulletActive,
            };
          })
      );

      // Check win condition
      const remainingInvaders = invaders.filter((invader) => invader.alive).length;
      if (remainingInvaders === 0) {
        setGameWon(true);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [invaders, bullets, player, gameOver, gameWon, lastInvaderMove, invaderDirection]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || gameWon) return;

      // Prevent default scrolling behavior
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
          setPlayer((prev) => ({
            ...prev,
            x: Math.max(0, prev.x - PLAYER_SPEED),
          }));
          break;
        case 'ArrowRight':
          setPlayer((prev) => ({
            ...prev,
            x: Math.min(CANVAS_WIDTH - PLAYER_WIDTH, prev.x + PLAYER_SPEED),
          }));
          break;
        case ' ':
          const now = Date.now();
          if (now - lastShot > 500) { // 500ms cooldown between shots
            setBullets((prev) => [
              ...prev,
              {
                x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
                y: player.y,
                active: true,
              },
            ]);
            setLastShot(now);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameWon, lastShot]);

  return (
    <GameContainer>
      <Score>Score: {score}</Score>
      <Canvas ref={canvasRef} />
      {gameOver && <GameOverText>GAME OVER</GameOverText>}
      {gameWon && <GameOverText>YOU WIN!</GameOverText>}
    </GameContainer>
  );
};

export default SpaceInvaders;

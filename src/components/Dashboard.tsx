import React from 'react';
import { styled } from 'styled-components';

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #000000;
  color: #00ff00;
  font-family: 'Press Start 2P', cursive;
  position: relative;
  padding: 40px;

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

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 60px;
  text-shadow: 4px 4px #003300;
  text-transform: uppercase;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  width: 100%;
`;

const GameCard = styled.div`
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  }
`;

const GameIcon = styled.div<{ icon: string }>`
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
  background-image: ${props => props.icon};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
`;

const GameTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  text-align: center;
`;

const GameDescription = styled.p`
  font-size: 14px;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const HighScore = styled.div`
  font-size: 16px;
  color: #ff9900;
`;

interface DashboardProps {
  onGameSelect: (game: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGameSelect }) => {
  const snakeHighScore = localStorage.getItem('snakeHighScore') || '0';
  const tetrisHighScore = localStorage.getItem('tetrisHighScore') || '0';
  const pongHighScore = localStorage.getItem('pongHighScore') || '0';
  const pacmanHighScore = localStorage.getItem('pacmanHighScore') || '0';
  const breakoutHighScore = localStorage.getItem('breakoutHighScore') || '0';

  return (
    <DashboardWrapper>
      <Title>RETRO ARCADE</Title>
      <GamesGrid>
        <GameCard onClick={() => onGameSelect('snake')}>
          <GameTitle>Snake</GameTitle>
          <GameDescription>
            Classic snake game. Eat the food, grow longer, and don't hit the walls or yourself!
          </GameDescription>
          <HighScore>High Score: {snakeHighScore}</HighScore>
        </GameCard>
        <GameCard onClick={() => onGameSelect('tetris')}>
          <GameTitle>Tetris</GameTitle>
          <GameDescription>
            Arrange falling blocks to create complete lines. Clear multiple lines at once for bonus points!
          </GameDescription>
          <HighScore>High Score: {tetrisHighScore}</HighScore>
        </GameCard>
        <GameCard onClick={() => onGameSelect('pong')}>
          <GameTitle>Pong</GameTitle>
          <GameDescription>
            Two-player classic! Use W/S and Up/Down arrows to move paddles. First to 11 points wins!
          </GameDescription>
          <HighScore>Best Rally: {pongHighScore}</HighScore>
        </GameCard>
        <GameCard onClick={() => onGameSelect('pacman')}>
          <GameTitle>Pac-Man</GameTitle>
          <GameDescription>
            Navigate the maze, eat dots, avoid ghosts! Power pellets turn the tables on the ghosts.
          </GameDescription>
          <HighScore>High Score: {pacmanHighScore}</HighScore>
        </GameCard>
        <GameCard onClick={() => onGameSelect('breakout')}>
          <GameTitle>Breakout</GameTitle>
          <GameDescription>
            Classic brick-breaking action! Move the paddle to bounce the ball and break all the bricks.
          </GameDescription>
          <HighScore>High Score: {breakoutHighScore}</HighScore>
        </GameCard>
      </GamesGrid>
    </DashboardWrapper>
  );
};

export default Dashboard;

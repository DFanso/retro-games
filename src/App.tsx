import React, { useState } from 'react';
import { styled } from 'styled-components';
import Dashboard from './components/Dashboard';
import Snake from './components/games/snake/Game';
import Tetris from './components/games/tetris/Tetris';
import Pong from './components/games/pong/Pong';
import Pacman from './components/games/pacman/Pacman';
import Breakout from './components/games/breakout/Breakout';
import './App.css';

const BackButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  padding: 10px 20px;
  background: #00ff00;
  border: none;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
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

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const handleGameSelect = (game: string) => {
    setCurrentGame(game);
  };

  const handleBack = () => {
    setCurrentGame(null);
  };

  return (
    <div className="App">
      {currentGame && <BackButton onClick={handleBack}>Back to Menu</BackButton>}
      {!currentGame && <Dashboard onGameSelect={handleGameSelect} />}
      {currentGame === 'snake' && <Snake />}
      {currentGame === 'tetris' && <Tetris />}
      {currentGame === 'pong' && <Pong />}
      {currentGame === 'pacman' && <Pacman />}
      {currentGame === 'breakout' && <Breakout />}
    </div>
  );
};

export default App;

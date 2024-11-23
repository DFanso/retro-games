import React from 'react';
import { styled } from 'styled-components';

type Position = [number, number];

interface BoardProps {
  snakeBody: Position[];
  food: Position;
  boardSize: number;
}

const BoardWrapper = styled.div<{ size: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.size}, 20px);
  grid-template-rows: repeat(${props => props.size}, 20px);
  gap: 1px;
  background-color: #1a1a1a;
  padding: 10px;
  border-radius: 4px;
  border: 2px solid #4a4a4a;
`;

const Cell = styled.div<{ isFood: boolean; isSnake: boolean }>`
  width: 20px;
  height: 20px;
  background-color: ${props =>
    props.isSnake ? '#00ff00' : props.isFood ? '#ff0000' : '#000000'};
  border-radius: 2px;
`;

const Board: React.FC<BoardProps> = ({ snakeBody, food, boardSize }) => {
  const renderBoard = () => {
    const board = [];
    
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const isFood = food[0] === row && food[1] === col;
        const isSnake = snakeBody.some(([x, y]) => x === row && y === col);
        
        board.push(
          <Cell
            key={`${row}-${col}`}
            isFood={isFood}
            isSnake={isSnake}
          />
        );
      }
    }
    
    return board;
  };

  return (
    <BoardWrapper size={boardSize}>
      {renderBoard()}
    </BoardWrapper>
  );
};

export default Board;

import React from 'react';
import '../App.css';

const Visualizer = ({ state }) => {
  // state can be: 'connecting', 'listening', 'speaking', 'idle'
  
  let animationClass = '';
  let statusText = '';
  
  switch(state) {
    case 'connecting':
      animationClass = 'state-connecting';
      statusText = 'connecting...';
      break;
    case 'listening':
      animationClass = 'state-listening';
      statusText = '';
      break;
    case 'speaking':
      animationClass = 'state-speaking';
      statusText = '';
      break;
    default:
      animationClass = '';
      statusText = '';
  }

  return (
    <div className="visualizer-container">
      {statusText && <span className="status-text">{statusText}</span>}
      <div className={`visualizer-circle ${animationClass}`}></div>
    </div>
  );
};

export default Visualizer;

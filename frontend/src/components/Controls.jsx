import React from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import '../App.css';

const Controls = ({ onMuteToggle, isMuted, onClose }) => {
  return (
    <div className="bottom-controls">
      <button className="control-btn" onClick={onMuteToggle} aria-label="Toggle Audio">
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
      
      <button className="control-btn" onClick={onClose} aria-label="Close">
        <X size={24} />
      </button>
    </div>
  );
};

export default Controls;

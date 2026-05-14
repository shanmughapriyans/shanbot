import React, { useState, useEffect } from 'react';
import { Menu, Send } from 'lucide-react';
import Visualizer from './components/Visualizer';
import ConversationalText from './components/ConversationalText';
import Controls from './components/Controls';
import { sendMessage } from './api';
import './App.css';

function App() {
  const [appState, setAppState] = useState('connecting'); // 'connecting', 'listening', 'speaking', 'idle'
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');

  // Simulation flow for demonstration
  useEffect(() => {
    // 1. Initial connection
    const connectTimer = setTimeout(() => {
      setAppState('speaking');
      setCurrentText('hi there! i am shanbot. how can i help you today?');
      setIsTyping(true);
      
      // 2. Wait for speaking to finish, then go idle/listening
      setTimeout(() => {
        setAppState('listening');
        setIsTyping(false);
      }, 3500);
      
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  const handleMuteToggle = () => setIsMuted(!isMuted);
  
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const userMessage = inputText;
    setInputText('');
    setAppState('connecting');
    setCurrentText('');
    setIsTyping(false);
    
    // Simulate thinking delay
    setTimeout(async () => {
      setAppState('speaking');
      setCurrentText('thinking...');
      
      let textToType = 'error connecting to the digital twin.';
      try {
        const result = await sendMessage(userMessage);
        if (result && result.response) {
          textToType = result.response;
        }
      } catch (e) {
        console.error(e);
      }
      
      setCurrentText(textToType);
      setIsTyping(true);
      
      // Let it stay in speaking mode until typing finishes + 2 seconds
      const typingDuration = textToType.length * 50;
      setTimeout(() => {
        setAppState('listening');
        setIsTyping(false);
      }, typingDuration + 2000);
    }, 500);
  };
  
  const handleClose = () => {
    setAppState('idle');
    setCurrentText('session ended. goodbye!');
    setIsTyping(false);
  };

  return (
    <div className="app-container">
      <nav className="top-nav">
        <button className="icon-btn" aria-label="Menu">
          <Menu size={24} />
        </button>
      </nav>

      <main className="main-content">
        <Visualizer state={appState} />
        
        {appState !== 'connecting' && (
          <ConversationalText text={currentText} isTyping={isTyping} />
        )}
        
        {appState !== 'connecting' && (
          <form className="chat-input-form" onSubmit={handleChatSubmit}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask ShanBot anything..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={appState === 'connecting'}
            />
            <button 
              type="submit" 
              className="chat-submit-btn" 
              disabled={!inputText.trim() || appState === 'connecting'}
              aria-label="Send Message"
            >
              <Send size={20} />
            </button>
          </form>
        )}
      </main>

      <Controls 
        isMuted={isMuted} 
        onMuteToggle={handleMuteToggle} 
        onClose={handleClose} 
      />
    </div>
  );
}

export default App;

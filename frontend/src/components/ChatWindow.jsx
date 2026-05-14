import Message from './Message';
import InputBar from './InputBar';

const ChatWindow = () => {
    return (
        <div className="chat-window">
            <div className="messages-container">
                <Message text="Hello! I am ShanBot." isUser={false} />
            </div>
            <InputBar />
        </div>
    );
};

export default ChatWindow;

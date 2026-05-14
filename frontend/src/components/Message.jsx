const Message = ({ text, isUser }) => {
    return (
        <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
            <p>{text}</p>
        </div>
    );
};

export default Message;

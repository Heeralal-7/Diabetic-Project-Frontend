import React, { useState, useRef, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const ChatComponent = ({ patientData, appointment }) => {
  const { sendChatNotification } = useContext(MyContext);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage or API
  useEffect(() => {
    const chatKey = `chat_${appointment._id}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      setChatMessages(JSON.parse(savedMessages));
    }
  }, [appointment._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!message.trim() || !patientData?.regId) return;

    setIsSending(true);
    
    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      sender: 'doctor',
      type: 'text'
    };

    try {
      // Send notification to patient
      await sendChatNotification(patientData.regId, message, 'text');
      
      // Add message to local state
      const updatedMessages = [...chatMessages, newMessage];
      setChatMessages(updatedMessages);
      
      // Save to localStorage
      const chatKey = `chat_${appointment._id}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const sendImageMessage = async (imageFile) => {
    if (!patientData?.regId) return;

    setIsSending(true);
    
    try {
      // In a real app, you would upload the image to your server first
      // For now, we'll just send a notification about the image
      await sendChatNotification(patientData.regId, '📷 Image', 'image');
      
      const newMessage = {
        id: Date.now(),
        text: '📷 Image sent',
        timestamp: new Date().toISOString(),
        sender: 'doctor',
        type: 'image',
        imageUrl: URL.createObjectURL(imageFile)
      };

      const updatedMessages = [...chatMessages, newMessage];
      setChatMessages(updatedMessages);
      
      const chatKey = `chat_${appointment._id}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendImageMessage(file);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h5>Chat with {patientData?.name || 'Patient'}</h5>
      </div>
      
      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'doctor' ? 'message-sent' : 'message-received'}`}
          >
            <div className="message-content">
              {msg.type === 'image' && msg.imageUrl ? (
                <img 
                  src={msg.imageUrl} 
                  alt="Shared" 
                  className="chat-image"
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                />
              ) : (
                <p>{msg.text}</p>
              )}
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="btn btn-outline-secondary">
            <i className="fas fa-image"></i>
          </label>
          
          <textarea
            className="form-control"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
            disabled={isSending}
          />
          
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Sending...</span>
              </div>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
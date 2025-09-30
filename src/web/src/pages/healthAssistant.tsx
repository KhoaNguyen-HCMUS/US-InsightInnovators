import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContainer from '../components/chat/chatContainer';
import { isAuthenticated } from '../utils/authStorage'; // ✅ 1. Import hàm kiểm tra xác thực

const HealthAssistant: React.FC = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();


  return (
    <div className="h-screen bg-gray-50">
      <title>Trợ lý Y khoa AI - Health Assistant</title>
      <ChatContainer />
    </div>
  );
};

export default HealthAssistant;
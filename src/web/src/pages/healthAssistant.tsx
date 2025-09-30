import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContainer from '../components/chat/chatContainer';
import { isAuthenticated } from '../utils/authStorage'; // ✅ 1. Import hàm kiểm tra xác thực

const HealthAssistant: React.FC = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth, navigate]);

  // ✅ 3. Chỉ render ChatContainer nếu đã đăng nhập
  if (!isAuth) {
    // Hiển thị một màn hình trống hoặc loading trong khi chuyển hướng
    return (
        <div className="h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-600">Redirecting to login...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <title>Trợ lý Y khoa AI - Health Assistant</title>
      <ChatContainer />
    </div>
  );
};

export default HealthAssistant;
import React from 'react';
import '../../../src/components/chat/chatAnimations.css';

interface ChatWelcomeProps {
  onStartChat: () => void;
}

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ onStartChat }) => {
  const quickQuestions = [
    {
      icon: '🤒',
      title: 'Kiểm tra triệu chứng',
      description: 'Tôi bị sốt và đau đầu từ 2 ngày nay',
      category: 'symptom_checker',
    },
    {
      icon: '💊',
      title: 'Tìm hiểu về bệnh',
      description: 'Triệu chứng của bệnh gan nhiễm mỡ',
      category: 'medical_diagnosis',
    },
    {
      icon: '❤️',
      title: 'Phòng ngừa sức khỏe',
      description: 'Cách phòng ngừa tăng huyết áp',
      category: 'general_health',
    },
    {
      icon: '🏥',
      title: 'Tư vấn khám bệnh',
      description: 'Khi nào cần đi khám bác sĩ?',
      category: 'general_health',
    },
  ];

  return (
    <div className='flex-1 flex items-center justify-center p-4 md:p-8'>
      <div className='max-w-4xl w-full text-center animate-fadeIn'>
        {/* Header */}
        <div className='mb-12'>
          <div className='w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center'>
            <svg className='w-10 h-10 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
              />
            </svg>
          </div>

          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Chào mừng đến với Trợ lý Y khoa AI</h1>

          <p className='text-xl text-gray-600 mb-6 max-w-2xl mx-auto'>
            Tôi là trợ lý AI chuyên về y khoa, sẵn sàng giúp bạn tư vấn về sức khỏe dựa trên các nguồn thông tin y khoa
            đáng tin cậy.
          </p>

          <div className='flex items-center justify-center space-x-6 text-sm text-gray-500'>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Thông tin y khoa đáng tin cậy</span>
            </div>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Trích dẫn nguồn rõ ràng</span>
            </div>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Phản hồi nhanh chóng</span>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className='mb-12'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-8'>Bạn có thể hỏi tôi về...</h2>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={onStartChat}
                className='p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-left group animate-fadeInUp'
              >
                <div className='text-3xl mb-3'>{question.icon}</div>
                <h3 className='font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200'>
                  {question.title}
                </h3>
                <p className='text-sm text-gray-600'>"{question.description}"</p>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className='mb-8'>
          <button
            onClick={onStartChat}
            className='inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:rotate-1'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <span>Bắt đầu trò chuyện</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto'>
          <div className='flex items-start space-x-3'>
            <svg
              className='w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
            <div className='text-sm text-yellow-800'>
              <p className='font-medium mb-1'>Lưu ý quan trọng:</p>
              <p>
                Thông tin tôi cung cấp chỉ mang tính tham khảo và không thay thế cho việc thăm khám trực tiếp với bác
                sĩ. Trong trường hợp khẩn cấp, hãy liên hệ ngay với cơ sở y tế gần nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;

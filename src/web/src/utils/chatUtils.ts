import type { ChatMessage } from '../types/chat';

export class ChatUtils {
  // Format timestamp for display
  static formatMessageTime(date: Date | string): string {
    const now = new Date();
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  // Extract medical citations from message
  static extractCitations(content: string): { content: string; citations: string[] } {
    const citationRegex = /\*\*Nguồn \(trích sách\):\*\*\s*"([^"]+)"/g;
    const citations: string[] = [];
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      citations.push(match[1]);
    }

    // Remove citation part from content for cleaner display
    const cleanContent = content.replace(/\*\*Nguồn \(trích sách\):\*\*.*$/gm, '').trim();

    return { content: cleanContent, citations };
  }

  // Generate session title from first message
  static generateSessionTitle(firstMessage?: string): string {
    if (!firstMessage) return 'Cuộc trò chuyện mới';

    // Take first 30 characters and add ellipsis if longer
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;

    return title;
  }

  // Check if message contains medical terms
  static containsMedicalTerms(content: string): boolean {
    const medicalKeywords = [
      'đau',
      'sốt',
      'ho',
      'nghẹt mũi',
      'chóng mặt',
      'buồn nôn',
      'bệnh',
      'triệu chứng',
      'thuốc',
      'khám',
      'bác sĩ',
      'điều trị',
      'gan',
      'tim',
      'phổi',
      'thận',
      'da',
      'mắt',
      'tai',
      'mũi',
    ];

    const lowerContent = content.toLowerCase();
    return medicalKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  // Scroll to bottom of chat
  static scrollToBottom(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}

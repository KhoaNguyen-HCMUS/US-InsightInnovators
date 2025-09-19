import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from '../context/themeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex items-center gap-2 p-2 rounded-lg bg-card'>
      <button
        onClick={() => setTheme('light')}
        className={`cursor-pointer p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white text-yellow-500 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title='Light mode'
      >
        <FaSun />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`cursor-pointer p-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-gray-800 text-blue-400 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title='Dark mode'
      >
        <FaMoon />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`cursor-pointer p-2 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title='System theme'
      >
        <FaDesktop />
      </button>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

export function ThemeToggle() {
  const setBackgroundConfig = useEditorStore((s) => s.setBackgroundConfig);
  const [isDark, setIsDark] = useState(() => {
    return !document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      setBackgroundConfig({ type: 'solid', color: '#111111' });
    } else {
      document.documentElement.classList.add('light');
      setBackgroundConfig({ type: 'solid', color: '#e5e5e5' });
    }
  }, [isDark, setBackgroundConfig]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative w-14 h-7 rounded-full border border-gray-700 light:border-gray-300 bg-gray-800 light:bg-gray-200 flex items-center transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track icons */}
      <Sun className="absolute left-1.5 w-3.5 h-3.5 text-amber-400 opacity-40" />
      <Moon className="absolute right-1.5 w-3.5 h-3.5 text-blue-300 opacity-40" />
      {/* Thumb */}
      <span
        className={`absolute top-[3px] w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
          isDark
            ? 'left-[calc(100%-23px)] bg-gray-600'
            : 'left-[3px] bg-white border border-gray-300'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-200" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}

'use client';

import { useMemo } from 'react';
import { getTimeOfDay, TIME_GRADIENTS, TIME_TEXT_COLORS } from '@/lib/theme';
import { useClientHour } from '@/lib/useClientHour';

export default function Footer() {
  const clientHour = useClientHour();

  const { gradientStyle, textClass } = useMemo(() => {
    const timeOfDay = getTimeOfDay(clientHour);
    const gradient = TIME_GRADIENTS[timeOfDay];
    const isLight = TIME_TEXT_COLORS[timeOfDay].isLight;

    return {
      gradientStyle: { background: `linear-gradient(to bottom, ${gradient.to}, ${gradient.to})` },
      textClass: isLight ? 'text-gray-700/60 hover:text-gray-700' : 'text-white/60 hover:text-white',
    };
  }, [clientHour]);

  return (
    <footer
      className="w-full py-4 text-center text-sm"
      style={gradientStyle}
    >
      <a
        href="https://forms.gle/m4DZwWHrbS6LTcEp8"
        target="_blank"
        rel="noopener noreferrer"
        className={`${textClass} transition-colors`}
      >
        문의하기
      </a>
    </footer>
  );
}

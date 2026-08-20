import React, { useEffect, useState } from 'react';

export const ReadingProgressBar: React.FC = () => {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(Math.min(100, Math.max(0, (currentProgress / scrollHeight) * 100)));
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[2.5px] z-50 bg-transparent pointer-events-none">
      <div
        className="h-full bg-neutral-900 dark:bg-white transition-all duration-75"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
};

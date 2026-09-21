import React from 'react';
import { MoodType } from '../types';

interface MoodFaceProps {
  mood: MoodType;
  className?: string;
  size?: number;
}

export const MoodFace: React.FC<MoodFaceProps> = ({ mood, className = '', size = 38 }) => {
  switch (mood) {
    case 'Happy':
      return (
        <div
          className={`rounded-full flex items-center justify-center bg-[#8fd3b6] text-[#14422b] shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 36 36" width={size * 0.75} height={size * 0.75} fill="none">
            {/* Eyes */}
            <circle cx="12" cy="14" r="2.2" fill="#1b4931" />
            <circle cx="24" cy="14" r="2.2" fill="#1b4931" />
            {/* Happy Smile */}
            <path
              d="M11 20.5C12.5 24.5 23.5 24.5 25 20.5"
              stroke="#1b4931"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'Okay':
      return (
        <div
          className={`rounded-full flex items-center justify-center bg-[#9cd1f6] text-[#123e61] shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 36 36" width={size * 0.75} height={size * 0.75} fill="none">
            {/* Eyes */}
            <circle cx="12" cy="14.5" r="2.2" fill="#144163" />
            <circle cx="24" cy="14.5" r="2.2" fill="#144163" />
            {/* Gentle slight smile */}
            <path
              d="M13 22C16 23.5 20 23.5 23 22"
              stroke="#144163"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'Not great':
      return (
        <div
          className={`rounded-full flex items-center justify-center bg-[#fad976] text-[#5c4305] shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 36 36" width={size * 0.75} height={size * 0.75} fill="none">
            {/* Eyes */}
            <circle cx="12" cy="15" r="2.2" fill="#4d3702" />
            <circle cx="24" cy="15" r="2.2" fill="#4d3702" />
            {/* Straight neutral mouth */}
            <path
              d="M13 22.5H23"
              stroke="#4d3702"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'Sad':
      return (
        <div
          className={`rounded-full flex items-center justify-center bg-[#c8b7e6] text-[#3c2a59] shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 36 36" width={size * 0.75} height={size * 0.75} fill="none">
            {/* Eyes */}
            <circle cx="12" cy="16" r="2.2" fill="#35244f" />
            <circle cx="24" cy="16" r="2.2" fill="#35244f" />
            {/* Downturned mouth */}
            <path
              d="M12 24C14.5 20.5 21.5 20.5 24 24"
              stroke="#35244f"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'Anxious':
      return (
        <div
          className={`rounded-full flex items-center justify-center bg-[#f8a8b6] text-[#5e1924] shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 36 36" width={size * 0.75} height={size * 0.75} fill="none">
            {/* Worried raised eyebrows */}
            <path d="M10 11.5L14 13" stroke="#4d121c" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M26 11.5L22 13" stroke="#4d121c" strokeWidth="1.6" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="12" cy="16" r="2.2" fill="#4d121c" />
            <circle cx="24" cy="16" r="2.2" fill="#4d121c" />
            {/* Wavy nervous mouth */}
            <path
              d="M12 23.5C14 22 16 25 18 23.5C20 22 22 25 24 23.5"
              stroke="#4d121c"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'Overwhelmed':
      return (
        <div
          className={`rounded-full flex items-center justify-center bg-[#f7ab94] text-[#632313] shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 36 36" width={size * 0.75} height={size * 0.75} fill="none">
            {/* Stressed eyes > < */}
            <path d="M10 13L14 15.5L10 18" stroke="#173d60" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 13L22 15.5L26 18" stroke="#173d60" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Stressed curved open mouth */}
            <path
              d="M13 23C15 20.5 21 20.5 23 23"
              stroke="#173d60"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M14 23.2C15.5 25.5 20.5 25.5 22 23.2"
              stroke="#173d60"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
  }
};

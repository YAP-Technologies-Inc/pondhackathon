'use client';

import React, { useState, useEffect } from 'react';
import { TablerCheck } from '@/icons';
import flame from '@/assets/flame.png';
import { useUserContext } from '@/context/UserContext';
import { useUserStats } from '@/hooks/useUserStats';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STORAGE_KEY = 'login-days';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const API_URL = "https://api.dev.yapapp.io";

const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export default function DailyStreak() {
  const { userId } = useUserContext();
  // pull your current & highest streak straight from the DB
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useUserStats(userId);

  const totalStreak = stats?.currentStreak ?? 0;
  const highestStreak = stats?.highestStreak ?? 0;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // weekly check‑in
  const [completedDays, setCompletedDays] = useState<boolean[]>(
    Array(7).fill(false)
  );
  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const weekStart = getStartOfWeek();

  useEffect(() => {
    // load this week's days
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { weekStart: ws, days } = JSON.parse(saved) as {
        weekStart: string;
        days: boolean[];
      };
      if (ws === weekStart) {
        // same week: mark today as done
        days[todayIndex] = true;
        setCompletedDays(days);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ weekStart: ws, days })
        );
      } else {
        // new week
        const fresh = Array(7).fill(false);
        fresh[todayIndex] = true;
        setCompletedDays(fresh);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ weekStart, days: fresh })
        );
      }
    } else {
      // first time
      const fresh = Array(7).fill(false);
      fresh[todayIndex] = true;
      setCompletedDays(fresh);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ weekStart, days: fresh })
      );
    }

    // sync your new total and highest streak up to the server
    if (userId) {
      fetch(`${API_URL}/api/user-stats/${userId}/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStreak: totalStreak,
          highestStreak,
        }),
      }).catch((err) => console.error('Sync streak error', err));
    }
  }, [userId, totalStreak, highestStreak, todayIndex, weekStart]);

  if (statsLoading) return null;
  if (statsError)
    return <p className="text-red-500">Failed to load streak data.</p>;

  return (
    <div className="bg-secondary w-full rounded-xl shadow px-6 py-4 flex flex-col border-b-2 border-gray-300 relative">
      {/* Header */}
      <div className="flex items-center gap-2 text-white mb-4">
        <img src={flame.src} alt="Flame icon" className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Daily Streak</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {totalStreak}
          </div>
          <span className="text-sm">/ Best: {highestStreak}</span>
        </div>
      </div>

      {/* Days */}
      <div className="w-full flex justify-around">
        {days.map((day, idx) => {
          const done = completedDays[idx];
          const isToday = idx === todayIndex;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ring-white opacity-50 ring-2
                  ${done ? 'bg-secondary text-white' : 'bg-secondary opacity-60'}
                  ${isToday ? 'ring-2 ring-tertiary' : ''}
                `}
              >
                {done && <TablerCheck className="w-5 h-5 text-white" />}
              </div>
              <span className="text-xs text-white mt-1">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

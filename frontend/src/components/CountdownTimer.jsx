import { useState, useEffect } from 'react';

// Har second update hone wala countdown
export const useCountdown = (targetDate) => {
  const getRemaining = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (Number.isNaN(diff)) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const total = Math.max(diff, 0);
    return {
      total,
      days: Math.floor(total / 86400000),
      hours: Math.floor((total / 3600000) % 24),
      minutes: Math.floor((total / 60000) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    setRemaining(getRemaining());
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return remaining;
};

const pad = (n) => String(n).padStart(2, '0');

const CountdownTimer = ({ targetDate, label, size = 'md', onComplete }) => {
  const { total, days, hours, minutes, seconds } = useCountdown(targetDate);
  const [done, setDone] = useState(false);

  // Timer khatam hote hi parent ko ek hi baar batao
  useEffect(() => {
    if (total === 0 && !done) {
      setDone(true);
      onComplete?.();
    }
    if (total > 0 && done) setDone(false);
  }, [total, done, onComplete]);

  if (total === 0) {
    return (
      <div className={`countdown countdown-${size} countdown-expired`}>
        <span className="countdown-label">Offer ended</span>
      </div>
    );
  }

  const units = [
    ...(days > 0 ? [{ value: days, unit: 'd' }] : []),
    { value: hours, unit: 'h' },
    { value: minutes, unit: 'm' },
    { value: seconds, unit: 's' },
  ];

  return (
    <div className={`countdown countdown-${size}`}>
      {label && <span className="countdown-label">{label}</span>}
      <div className="countdown-units">
        {units.map((u, i) => (
          <span key={u.unit} className="countdown-unit">
            <span className="countdown-value">{pad(u.value)}</span>
            <span className="countdown-suffix">{u.unit}</span>
            {i < units.length - 1 && <span className="countdown-sep">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;

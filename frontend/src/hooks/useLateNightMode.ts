import { useEffect, useState } from 'react';

function isLateNight(date = new Date()) {
  const hour = date.getHours();
  return hour >= 0 && hour < 6;
}

export function useLateNightMode() {
  const [enabled, setEnabled] = useState(() => isLateNight());

  useEffect(() => {
    const id = window.setInterval(() => setEnabled(isLateNight()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return enabled;
}

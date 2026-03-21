export default function TimerDisplay({ timeLeft }: { timeLeft: number }) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return <h2 className="timer">{formatTime(timeLeft)}</h2>;
}

export default function Controls({
  isWork,
  customMinutes,
  setIsWork,
  setIsRunning,
  setTimeLeft,
  startTimer,
}: any) {
  return (
    <div className="button-group">
      <button className="btn start" onClick={startTimer}>Start</button>
      <button className="btn pause" onClick={() => setIsRunning(false)}>Pause</button>
      <button
        className="btn reset"
        onClick={() => {
          setIsRunning(false);
          setTimeLeft(isWork ? customMinutes * 60 : 5 * 60);
        }}
      >
        Reset
      </button>
      {!isWork && (
        <button
          className="btn cancel"
          onClick={() => {
            setIsWork(true);
            setIsRunning(false);
            setTimeLeft(customMinutes * 60);
          }}
        >
          Cancel Break
        </button>
      )}
    </div>
  );
}

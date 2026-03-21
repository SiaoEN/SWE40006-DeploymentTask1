export default function DurationSlider({ customMinutes, setCustomMinutes, setTimeLeft }: any) {
  return (
    <div className="slider-container">
      <label>Set Work Duration: {customMinutes} min</label>
      <input
        type="range"
        min="1"
        max="60"
        value={customMinutes}
        onChange={(e) => {
          const newMinutes = parseInt(e.target.value);
          setCustomMinutes(newMinutes);
          setTimeLeft(newMinutes * 60);
        }}
      />
    </div>
  );
}

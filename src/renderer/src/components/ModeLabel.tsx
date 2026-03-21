export default function ModeLabel({ isWork }: { isWork: boolean }) {
  return <h1 className="mode-label">{isWork ? "Work" : "Break"} Time</h1>;
}

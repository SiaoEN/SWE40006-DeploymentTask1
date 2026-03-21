import { format } from "date-fns";

type Session = {
  time: Date;
  type: "work" | "break";
};

export default function SessionLog({ sessions }: { sessions: Session[] }) {
  return (
    <div className="session-log">
      <h3>Completed Sessions</h3>
      {sessions.length === 0 ? (
        <p className="empty">No sessions yet</p>
      ) : (
        <ul>
          {sessions.map((s, i) => (
            <li key={i} className="session-item">
              {s.type === "work"
                ? `Work session finished at ${format(s.time, "HH:mm:ss")}`
                : `Break session finished at ${format(s.time, "HH:mm:ss")}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

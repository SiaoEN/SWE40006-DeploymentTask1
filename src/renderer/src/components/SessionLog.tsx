import { format } from "date-fns";

type Session = {
  completedAt: Date;
  type: "work" | "break";
  durationMinutes: number;
};

type SessionLogProps = {
  sessions: Session[];
  onClearToday: () => void;
  onClearAll: () => void;
  onDeleteRecord: (index: number) => void;
};

export default function SessionLog({ sessions, onClearToday, onClearAll, onDeleteRecord }: SessionLogProps) {
  return (
    <div className="session-log">
      <h3>Completed Sessions</h3>
      <div className="session-log-actions">
        <button className="btn clear-today" onClick={onClearToday}>Clear Today</button>
        <button className="btn clear-all" onClick={onClearAll}>Clear All Data</button>
      </div>
      {sessions.length === 0 ? (
        <p className="empty">No sessions yet</p>
      ) : (
        <ul>
          {sessions.map((s, i) => (
            <li key={i} className="session-item">
              <span>
                {s.type === "work"
                  ? `Work session (${s.durationMinutes} min) finished at ${format(s.completedAt, "HH:mm:ss")}`
                  : `Break session (${s.durationMinutes} min) finished at ${format(s.completedAt, "HH:mm:ss")}`}
              </span>
              <button
                className="record-delete"
                aria-label="Delete record"
                title="Delete record"
                onClick={() => onDeleteRecord(i)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

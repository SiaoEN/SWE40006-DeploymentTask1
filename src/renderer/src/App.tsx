// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'

// function App(): React.JSX.Element {
//   const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

//   return (
//     <>
//       <img alt="logo" className="logo" src={electronLogo} />
//       <div className="creator">Powered by electron-vite</div>
//       <div className="text">
//         Build an Electron app with <span className="react">React</span>
//         &nbsp;and <span className="ts">TypeScript</span>
//       </div>
//       <p className="tip">
//         Please try pressing <code>F12</code> to open the devTool
//       </p>
//       <div className="actions">
//         <div className="action">
//           <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
//             Documentation
//           </a>
//         </div>
//         <div className="action">
//           <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
//             Send IPC
//           </a>
//         </div>
//       </div>
//       <Versions></Versions>
//     </>
//   )
// }

// export default App

import { useState, useEffect, useRef } from "react";
import "./App.css";
import beepSound from "./beep.mp3";
import Controls from "./components/Controls";
import DurationSlider from "./components/DurationSlider";
import ModeLabel from "./components/ModeLabel";
import SessionLog from "./components/SessionLog";
import Statistics from "./components/Statistics";
import TimerDisplay from "./components/TimerDisplay";

type Session = {
  completedAt: Date;
  type: "work" | "break";
  durationMinutes: number;
};

function App() {
  const [customMinutes, setCustomMinutes] = useState(25); // default 25
  const [timeLeft, setTimeLeft] = useState(customMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('pomodoroSessions');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        completedAt: new Date(s.completedAt)
      }));
    } catch {
      return [];
    }
  });

  const beepRef = useRef(new Audio(beepSound));

  useEffect(() => {
    beepRef.current.preload = "auto";
    beepRef.current.volume = 1;
  }, []);

  const playBeep = () => {
    const audio = beepRef.current;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // ignore intermittent autoplay/audio-device promise errors
    });
  };

  const primeBeepAudio = () => {
    const audio = beepRef.current;
    const previousMuted = audio.muted;
    audio.muted = true;
    audio.currentTime = 0;
    void audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = previousMuted;
      })
      .catch(() => {
        audio.muted = previousMuted;
      });
  };

  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
  let timer: NodeJS.Timeout | null = null;
  if (isRunning && endTime) {
    timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        playBeep();
        const completedSessionType: Session["type"] = isWork ? "work" : "break";
        const completedDurationMinutes = completedSessionType === "work" ? customMinutes : 5;
        setSessions((prev) => [
          ...prev,
          {
            completedAt: new Date(),
            type: completedSessionType,
            durationMinutes: completedDurationMinutes
          }
        ]);

        setIsWork((prev) => !prev);
        const nextDuration = isWork ? 5 * 60 : customMinutes * 60;
        setEndTime(new Date(Date.now() + nextDuration * 1000));
        setTimeLeft(nextDuration);
      }
    }, 1000);
  }

  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}, [isRunning, endTime, isWork, customMinutes]);


  // const formatTime = (seconds: number) => {
  //   const m = Math.floor(seconds / 60);
  //   const s = seconds % 60;
  //   return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  // };

//   return (
//     <div className="app-container">
//       <h1 className="mode-label">{isWork ? "Work" : "Break"} Time</h1>
//       <h2 className="timer">{formatTime(timeLeft)}</h2>

//       {/* Slider to adjust minutes */}
//       <div className="slider-container">
//         <label>Set Work Duration: {customMinutes} min</label>
//         <input
//           type="range"
//           min="1"
//           max="60"
//           value={customMinutes}
//           onChange={(e) => {
//             const newMinutes = parseInt(e.target.value);
//             setCustomMinutes(newMinutes);
//             setTimeLeft(newMinutes * 60);
//           }}
//         />
//       </div>

//       <div className="button-group">
//         <button className="btn start" onClick={() => setIsRunning(true)}>Start</button>
//         <button className="btn pause" onClick={() => setIsRunning(false)}>Pause</button>
//         <button
//           className="btn reset"
//           onClick={() => {
//             setIsRunning(false);
//             setTimeLeft(isWork ? customMinutes * 60 : 5 * 60);
//           }}
//         >
//           Reset
//         </button>

//         {/* Cancel Break button */}
//         {!isWork && (
//           <button
//             className="btn cancel"
//             onClick={() => {
//               setIsWork(true);
//               setIsRunning(false);
//               setTimeLeft(customMinutes * 60);
//             }}
//           >
//             Cancel Break
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

  const startTimer = () => {
  primeBeepAudio();
  const newEndTime = new Date(Date.now() + timeLeft * 1000);
  setEndTime(newEndTime);
  setIsRunning(true);
  setTimeLeft(Math.floor((newEndTime.getTime() - Date.now()) / 1000)); // ensures full duration shows
};

  const clearTodayRecords = () => {
    const today = new Date().toDateString();
    setSessions((prev) => prev.filter((session) => session.completedAt.toDateString() !== today));
  };

  const clearAllRecords = () => {
    setSessions([]);
  };

  const deleteSingleRecord = (indexToDelete: number) => {
    setSessions((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

 return (
    <div className="app-layout">
      <div className="app-container timer-panel">
        <ModeLabel isWork={isWork} />
        <TimerDisplay timeLeft={timeLeft} />
        <DurationSlider customMinutes={customMinutes} setCustomMinutes={setCustomMinutes} setTimeLeft={setTimeLeft} />
        <Controls isWork={isWork} customMinutes={customMinutes} setIsWork={setIsWork} setIsRunning={setIsRunning} setTimeLeft={setTimeLeft} startTimer={startTimer} />
        <SessionLog
          sessions={sessions}
          onClearToday={clearTodayRecords}
          onClearAll={clearAllRecords}
          onDeleteRecord={deleteSingleRecord}
        />
      </div>

      <div className="app-container stats-panel">
        <Statistics sessions={sessions} />
      </div>
    </div>
  );
}

export default App;

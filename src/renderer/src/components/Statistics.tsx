import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';
import { format, startOfDay, subDays } from 'date-fns';

const QUOTE_STORAGE_KEY = 'pomodoroLastQuote';
const QUOTE_REQUEST_TIMEOUT_MS = 4500;
const FALLBACK_QUOTES = [
  'Stay focused and keep going!',
  'Small progress each day adds up to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  'Your future self will thank you for today’s effort.',
  'Consistency beats intensity when intensity is inconsistent.',
  'Done is better than perfect. Start now.'
];

const QUOTE_SOURCES = [
  {
    name: 'dummyjson',
    url: 'https://dummyjson.com/quotes/random',
    pick: (data: any) => (data?.quote ?? '').trim()
  },
  {
    name: 'quotable',
    url: 'https://api.quotable.io/random?tags=motivational',
    pick: (data: any) => (data?.content ?? '').trim()
  },
  {
    name: 'zenquotes',
    url: 'https://zenquotes.io/api/random',
    pick: (data: any) => (Array.isArray(data) ? (data[0]?.q ?? '').trim() : '')
  }
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Session = {
  completedAt: Date;
  type: 'work' | 'break';
  durationMinutes: number;
};

export default function Statistics({ sessions }: { sessions: Session[] }) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    let cancelled = false;

    const setAndRememberQuote = (text: string) => {
      if (cancelled) return;
      setQuote(text);
      localStorage.setItem(QUOTE_STORAGE_KEY, text);
    };

    const pickFallbackQuote = (lastQuote: string | null) => {
      const pool = FALLBACK_QUOTES.filter((entry) => entry !== lastQuote);
      return pool[Math.floor(Math.random() * pool.length)] || FALLBACK_QUOTES[0];
    };

    const fetchQuote = async () => {
      const lastQuote = localStorage.getItem(QUOTE_STORAGE_KEY);

      const tryFetchFromSources = async () => {
        for (const source of QUOTE_SOURCES) {
          try {
            const response = await axios.get(source.url, { timeout: QUOTE_REQUEST_TIMEOUT_MS });
            const value = source.pick(response.data);
            if (value && value !== lastQuote) {
              return value;
            }
          } catch {
            // try next source
          }
        }
        return null;
      };

      const nextQuote = await tryFetchFromSources();

      if (nextQuote) {
        setAndRememberQuote(nextQuote);
      } else {
        setAndRememberQuote(pickFallbackQuote(lastQuote));
      }
    };

    fetchQuote();

    return () => {
      cancelled = true;
    };
  }, []);

  const sevenDayStats = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(startOfDay(new Date()), 6 - index);
    return {
      key: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE dd/MM'),
      workMinutes: 0,
      breakMinutes: 0
    };
  });

  const statsByDate = new Map(sevenDayStats.map((entry) => [entry.key, entry]));

  sessions.forEach((session) => {
    const key = format(startOfDay(session.completedAt), 'yyyy-MM-dd');
    const bucket = statsByDate.get(key);

    if (!bucket) return;

    if (session.type === 'work') {
      bucket.workMinutes += session.durationMinutes;
    } else {
      bucket.breakMinutes += session.durationMinutes;
    }
  });

  const labels = sevenDayStats.map((entry) => entry.label);
  const workSeries = sevenDayStats.map((entry) => entry.workMinutes);
  const breakSeries = sevenDayStats.map((entry) => entry.breakMinutes);

  const totalWorkMinutes = sessions
    .filter((session) => session.type === 'work')
    .reduce((total, session) => total + session.durationMinutes, 0);

  const totalBreakMinutes = sessions
    .filter((session) => session.type === 'break')
    .reduce((total, session) => total + session.durationMinutes, 0);

  const barData = {
    labels,
    datasets: [
      {
        label: 'Work Time (mins)',
        data: workSeries,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Break Time (mins)',
        data: breakSeries,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ]
  };

  const pieData = {
    labels: ['Work Time', 'Break Time'],
    datasets: [
      {
        data: [totalWorkMinutes, totalBreakMinutes],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      }
    ]
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Weekly Statistics</h2>
      <Bar data={barData} />
      <br></br>
      <h2>Overall Totals</h2>
      <div style={{ width: '250px', height: '250px', margin: '0 auto' }}>
        <Pie data={pieData} options={pieOptions} />
      </div>
      <blockquote style={{ marginTop: '20px', fontStyle: 'italic', textAlign: 'center' }}>
        {quote}
      </blockquote>
    </div>
  );
}

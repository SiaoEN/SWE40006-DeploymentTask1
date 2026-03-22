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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Statistics() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Fetch motivational quote
    axios.get('https://api.quotable.io/random?tags=motivational')
      .then(res => setQuote(res.data.content))
      .catch(() => setQuote('Stay focused and keep going!'));
  }, []);

  // Example data: replace with your session log aggregation
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Work Time (mins)',
        data: [120, 90, 100, 80, 150, 60, 110],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Break Time (mins)',
        data: [30, 20, 25, 15, 40, 10, 35],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ]
  };

  const pieData = {
    labels: ['Work Time', 'Break Time'],
    datasets: [
      {
        data: [710, 175], // totals across the week
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      }
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Weekly Statistics</h2>
      <Bar data={barData} />
      <h2>Overall Totals</h2>
      <Pie data={pieData} />
      <blockquote style={{ marginTop: '20px', fontStyle: 'italic' }}>
        {quote}
      </blockquote>
    </div>
  );
}

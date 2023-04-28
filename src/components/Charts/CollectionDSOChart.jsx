import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  Filler,
} from 'chart.js';

const CollectionDSOChart = (props) => {
  const { dataLine, heightProps, setChartRef } = props;
  const chartRef = React.useRef();
  const device = localStorage.getItem('device_detect');

  React.useEffect(() => {
    if (setChartRef) {
      setChartRef(chartRef);
    }
  }, [chartRef]);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    BarController,
    LineController,
    Filler,
  );

  const optionsLine = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.label || '';

            if (label) {
              label += ': ';
            }
            if (context.dataset.data) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(context.raw);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        display: false,
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: device === 'mobile' ? 10 : 15,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    elements: { line: { fill: true } },
  };

  return (
    <div style={{ margin: '0 2vw 2vh' }}>
      <Line
        data={dataLine}
        options={optionsLine}
        height={heightProps || '150px'}
        ref={chartRef}
      />
    </div>
  );
};

export default CollectionDSOChart;

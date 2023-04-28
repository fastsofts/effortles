import React from 'react';
import { Line } from 'react-chartjs-2';
import * as Mui from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  DoughnutController,
  ArcElement,
} from 'chart.js';
import css from '../dashboardStyles.scss';

const Chart3 = (props) => {
  const { labels } = props;
  const { data } = props;
  const navigate = useNavigate();
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  );

  const options = {
    onClick: () => {
      navigate('/receivables');
    },
    scales: {
      yAxes: {
        ticks: {
          callback: (value) => {
            const ranges = [
              { divider: 1e6, suffix: 'M' },
              { divider: 1e3, suffix: 'k' },
            ];
            function formatNumber(n) {
              let i;
              for (i = 0; i < ranges.length; i += 1) {
                if (Math.abs(n) >= ranges[i].divider) {
                  return (n / ranges[i].divider).toString() + ranges[i].suffix;
                }
              }
              return n;
            }
            return formatNumber(value);
          },
        },
      },
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          textAlign: 'center',
          padding: 30,
        },
      },
      tooltip:{
        callbacks: {
          label: (context) => {
              let label = context.label || '';

              if (label) {
                  label += ': ';
              }
              if (context.dataset.data) {
                  label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.raw);
              }
              return label;
          }
        }
      }
    },
    elements: { line: { fill: false } },
  };

  const legend = {
    display: true,
    position: 'bottom',
    labels: {
      fontColor: '#323130',
      fontSize: 14,
    },
  };

  // const labels = ['Dec', 'Jan', 'Feb'];

  const dataVal = {
    labels,
    datasets: [
      {
        label: data && data.length > 0 && data[0].label,
        data: data && data.length > 0 && data[0].data,
        // fill: true,
        borderColor: '#FF0000',
        backgroundColor: '#FF0000',
        pointRadius: 0,
      },
      {
        label: data && data.length > 0 && data[1].label,
        data: data && data.length > 0 && data[1].data,
        // fill: true,
        borderColor: '#00A676',
        backgroundColor: '#00A676',
        pointRadius: 0,
      },
    ],
  };
  const device = localStorage.getItem('device_detect');
  return (
    <>
      {device === 'desktop' ? (
        <>
          <Mui.Stack style={{ textAlign: 'center', margin: '1rem' }}>
            <div style={{ marginTop: '3rem' }}>
              <Line
                data={dataVal}
                legend={legend}
                options={options}
                height="130"
              />
            </div>
          </Mui.Stack>
        </>
      ) : (
        <>
          <Mui.Stack className={css.chartStack}>
            <Mui.Card
              className={css.chartStackMain}
              style={{
                boxShadow: '6px 7px 10px #e6e6e6, -6px -3px 10px #e6e6e6',
                // height: '324px',
                // width: '279px',
                borderRadius: '17px',
              }}
            >
              <Mui.Stack style={{ textAlign: 'center', margin: '1rem' }}>
                <Mui.Typography noWrap>
                  {' '}
                  Collection and Performance
                </Mui.Typography>
                <div style={{ marginTop: '1rem' }} className={css.thirdchart}>
                  <Line
                    data={dataVal}
                    legend={legend}
                    options={options}
                    height="300"
                  />
                </div>
              </Mui.Stack>
            </Mui.Card>
          </Mui.Stack>
        </>
      )}
    </>
  );
};

export default Chart3;

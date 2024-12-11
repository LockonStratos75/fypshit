// backend/utils/chartGenerator.js

const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 600; // px
const height = 400; // px
const chartCallback = (ChartJS) => {
  // Global config for ChartJS can be added here
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

exports.generateChartBase64 = async (sanityLevels, sentimentScores, serResults) => {
  // Example: Generate a line chart for sanity levels over time

  const labels = sanityLevels
    .slice()
    .reverse()
    .map((level) => new Date(level.createdAt).toLocaleDateString());

  const data = sanityLevels
    .slice()
    .reverse()
    .map((level) => level.sanityPercentage);

  const configuration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Sanity Level (%)',
          data,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Sanity Level (%)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
      },
    },
  };

  const image = await chartJSNodeCanvas.renderToDataURL(configuration);
  return image;
};

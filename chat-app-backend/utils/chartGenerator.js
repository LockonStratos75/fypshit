// backend/utils/chartGenerator.js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

exports.generateChartBase64 = async (sanityLevels, sentiments, serResults) => {
  const width = 800; 
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  // Extract data for sanity over time
  const labels = sanityLevels.map(sl => new Date(sl.createdAt).toLocaleDateString());
  const data = sanityLevels.map(sl => sl.sanityPercentage);

  const configuration = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sanity Level (%)',
        data: data,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'User Sanity Level Over Time'
        }
      }
    }
  };

  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  const imageBase64 = imageBuffer.toString('base64');
  return `data:image/png;base64,${imageBase64}`;
};

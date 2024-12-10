

// backend/utils/chartGenerator.js
const axios = require('axios');

exports.generateChartBase64 = async (sanityLevels, sentiments, serResults) => {
  // Extract data for sanity over time
  const labels = sanityLevels.map(sl => new Date(sl.createdAt).toLocaleDateString());
  const data = sanityLevels.map(sl => sl.sanityPercentage);

  // Construct the chart configuration for QuickChart
  const chartConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Sanity Level (%)',
        data: data,
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'User Sanity Level Over Time'
        }
      }
    }
  };

  try {
    // Use QuickChart's API to generate the chart image
    const response = await axios({
      method: 'post',
      url: 'https://quickchart.io/chart',
      responseType: 'arraybuffer',
      data: {
        chart: chartConfig,
        width: 800,
        height: 400,
        format: 'png',
        backgroundColor: 'white'
      }
    });

    // Convert binary data to base64
    const imageBuffer = Buffer.from(response.data, 'binary');
    const imageBase64 = imageBuffer.toString('base64');
    return `data:image/png;base64,${imageBase64}`;
  } catch (error) {
    console.error('Error generating chart:', error.message);
    return null;
  }
};

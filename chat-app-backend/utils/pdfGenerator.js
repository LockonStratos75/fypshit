// backend/utils/pdfGenerator.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright'); // Replaces puppeteer

exports.generatePDF = async (templateName, userData) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'reportTemplate.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with user data
    html = html.replace('{{username}}', userData.user.username || 'N/A');
    html = html.replace('{{email}}', userData.user.email || 'N/A');
    html = html.replace('{{age}}', userData.user.age ? userData.user.age.toString() : 'N/A');
    html = html.replace('{{location}}', userData.user.location || 'N/A');

    const userInfoStr = `Email: ${userData.user.email}, Age: ${userData.user.age || 'N/A'}, Location: ${userData.user.location || 'N/A'}`;
    html = html.replace('{{user_info}}', userInfoStr);

    const recentSanity = userData.sanityLevels.length > 0 ? userData.sanityLevels[0].sanityPercentage.toString() : 'N/A';
    html = html.replace('{{recentSanity}}', recentSanity);

    let avgSent = 'N/A';
    if (userData.sentimentScores.length > 0) {
      const sumSent = userData.sentimentScores.reduce((acc, s) => acc + s.averageSentiment, 0);
      avgSent = (sumSent / userData.sentimentScores.length).toFixed(2);
    }
    html = html.replace('{{averageSentiment}}', avgSent);

    let dominantEmotion = 'N/A';
    if (userData.serResults.length > 0 && userData.serResults[0].highestEmotion && userData.serResults[0].highestEmotion.label) {
      dominantEmotion = userData.serResults[0].highestEmotion.label;
    }
    html = html.replace('{{dominantEmotion}}', dominantEmotion);

    html = html.replace('{{chartBase64}}', userData.chartBase64 || '');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    // 'networkidle' ensures all images/fonts are loaded
    await page.setContent(html, { waitUntil: 'networkidle' });

    const reportsDir = path.join(__dirname, '..', 'public', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `report_${Date.now()}.pdf`;
    const pdfPath = path.join(reportsDir, filename);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    return path.join('reports', filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

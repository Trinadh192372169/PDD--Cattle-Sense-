require('dotenv').config();

const config = {
  baseUrl: process.env.BASE_URL || 'https://Trinadh192372169.github.io/PDD--Cattle-Sense-/',
  fallbackUrl: process.env.FALLBACK_URL || 'http://localhost:8081',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false',
  timeout: parseInt(process.env.TIMEOUT || '15000', 10),
  pollInterval: 500,
  retries: 2,
  reportsDir: process.env.REPORTS_DIR || '../../Test Results',
  screenshotsDir: process.env.SCREENSHOTS_DIR || '../../Test Results/Screenshots',
  logsDir: process.env.LOGS_DIR || '../../Test Results/Logs'
};

module.exports = config;

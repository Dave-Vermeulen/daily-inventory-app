// Import dependencies
const moment = require('moment');
const Chart = require('chart.js');

// Initialize database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Function to create tables
function createTables() {
  db.serialize(function() {
    db.run(`
      CREATE TABLE IF NOT EXISTS daily_inventories (
        id INTEGER PRIMARY KEY,
        date TEXT,
        enjoyment TEXT,
        allah_connection TEXT,
        service_to_others TEXT,
        feelings TEXT,
        progress TEXT,
        mood TEXT
      );
    `);
  });
}

// Create tables
createTables();

// Function to submit form data
function submitFormData(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = {
    date: formData.get('date'),
    enjoyment: formData.get('enjoyment'),
    allahConnection: formData.get('allah-connection'),
    serviceToOthers: formData.get('service-to-others'),
    feelings: formData.get('feelings'),
    progress: formData.get('progress'),
    mood: formData.get('mood'),
  };

  // Insert data into database
  db.serialize(function() {
    const stmt = db.prepare(`
      INSERT INTO daily_inventories (date, enjoyment, allah_connection, service_to_others, feelings, progress, mood)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);
    stmt.run([
      data.date,
      data.enjoyment,
      data.allahConnection,
      data.serviceToOthers,
      data.feelings,
      data.progress,
      data.mood,
    ]);
    stmt.finalize();
  });

  // Display summary
  displaySummary(data);
}

// Function to display summary
function displaySummary(data) {
  const summaryContainer = document.getElementById('summary-container');
  const summary = document.getElementById('summary');
  summary.textContent = `
    Date: ${data.date}
    Enjoyment: ${data.enjoyment}
    Allah Connection: ${data.allahConnection}
    Service to Others: ${data.serviceToOthers}
    Feelings: ${data.feelings}
    Progress: ${data.progress}
    Mood: ${data.mood}
  `;
  summaryContainer.style.display = 'block';
}

// Function to get data for chart
function getDataForChart() {
  db.serialize(function() {
    db.all('SELECT * FROM daily_inventories', (err, rows) => {
      if (err) {
        console.error(err);
      } else {
        const chartData = rows.map((row) => ({
          date: row.date,
          mood: row.mood,
        }));
        displayChart(chartData);
      }
    });
  });
}

// Function to display chart
function displayChart(data) {
  const ctx = document.getElementById('chart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((item) => item.date),
      datasets: [{
        label: 'Mood',
        data: data.map((item) => item.mood),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Get data for chart
getDataForChart();

// Add event listener to form submission
document.getElementById('daily-form').addEventListener('submit', submitFormData);
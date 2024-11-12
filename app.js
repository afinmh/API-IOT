const express = require('express');
const app = express();
app.use(express.json());

// Sample data in the required format
let data = {
  suhumax: 0,
  suhumin: 0,
  suhurata: 0,
  nilai_suhu_max_humid_max: [
    {
      idx: 101,
      suhu: 36,
      humid: 36,
      kecerahan: 25,
      timestamp: "2010-09-18 07:23:48"
    },
    {
      idx: 226,
      suhu: 21,
      humid: 36,
      kecerahan: 27,
      timestamp: "2011-05-02 12:29:34"
    }
  ],
  month_year_max: [
    { month_year: "" },
    { month_year: "" }
  ]
};

// Function to calculate max, min, and average temperatures, as well as oldest and latest dates
function calculateStatistics() {
  let suhuMax = -Infinity;
  let suhuMin = Infinity;
  let suhuTotal = 0;
  let count = 0;
  let oldestTimestamp = null;
  let latestTimestamp = null;

  data.nilai_suhu_max_humid_max.forEach(entry => {
    const suhu = entry.suhu;
    const timestamp = new Date(entry.timestamp);

    // Update suhuMax and suhuMin
    if (suhu > suhuMax) suhuMax = suhu;
    if (suhu < suhuMin) suhuMin = suhu;

    // Sum up suhu for average calculation
    suhuTotal += suhu;
    count++;

    // Update oldest and latest timestamps
    if (!oldestTimestamp || timestamp < oldestTimestamp) oldestTimestamp = timestamp;
    if (!latestTimestamp || timestamp > latestTimestamp) latestTimestamp = timestamp;
  });

  const suhuRataRata = count > 0 ? suhuTotal / count : 0;

  // Update data dictionary
  data.suhumax = suhuMax;
  data.suhumin = suhuMin;
  data.suhurata = suhuRataRata;
  if (oldestTimestamp) data.month_year_max[0].month_year = oldestTimestamp.toISOString().slice(0, 7);
  if (latestTimestamp) data.month_year_max[1].month_year = latestTimestamp.toISOString().slice(0, 7);
}

// Route to render HTML (assuming an index.html file in the views folder)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Route to get data (GET request)
app.get('/data', (req, res) => {
  calculateStatistics(); // Recalculate every time data is requested
  res.json(data);
});

// Route to update data (POST request)
app.post('/data', (req, res) => {
  const newData = req.body; // Get JSON data from request
  if (newData) {
    // Update existing data with new data
    data = { ...data, ...newData };
    calculateStatistics(); // Recalculate after updating data
    res.status(200).json({ message: "Data successfully updated", data });
  } else {
    res.status(400).json({ message: "Invalid data provided" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

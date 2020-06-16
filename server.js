const fs = require('fs');
const express = require('express');

const app = express();

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server up on port ${PORT}`));

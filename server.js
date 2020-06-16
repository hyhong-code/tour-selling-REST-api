const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ success: true });
});

app.post('/', (req, res) => {
  res.json({ success: 'posted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server up on port ${PORT}`));

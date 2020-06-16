require('dotenv').config({ path: './config.env' });
const app = require('./app');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server up on port ${PORT}`));

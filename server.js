require('dotenv').config();  // Load environment variables

const express = require('express');
const app = express();

app.use(express.json());  // Middleware to parse JSON bodies

// Dummy login route for admin authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Login request received:', { username, password });  // Debugging: Log the request

  // Check if the password matches the one in the .env file
  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ message: 'Login successful!' });
  } else {
    console.error('Incorrect password');  // Debugging: Log incorrect password
    return res.status(401).json({ message: 'Incorrect password' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

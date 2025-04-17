const express = require('express');
const cors = require('cors');
require('dotenv').config();

const loginUser = require('./routes/loginUser');
const registerUser = require('./routes/registerUser');
const updateEmergencyContacts = require('./routes/updateEmergencyContacts');
const getEmergencyContacts = require('./routes/getEmergencyContacts');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/loginUser', loginUser);
app.use('/registerUser', registerUser);
app.use('/updateEmergencyContacts', updateEmergencyContacts);
app.use('/getEmergencyContacts', getEmergencyContacts);
app.use('/sendAlerts', require('./routes/sendAlerts'));

// Root Test
app.get('/', (req, res) => res.json({ message: 'API is working' }));

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

const express = require('express');
const connectDB = require('./config/db');
//add cors
const cors = require('cors');
const corsOptions = {
  origin: '*',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

//added cors

const app = express();

//connect DATABASE
connectDB();

// Init Middleware

app.use(express.json({ extended: false }));
app.use(cors(corsOptions)); // Use this after the variable declaration
app.get('/', (req, res) => res.send('API Running'));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

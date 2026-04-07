const dotenv = require('dotenv')
dotenv.config();
const express = require('express'),
  cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');
const siteRoutes = require('./routes/routing')
const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(siteRoutes);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Postgres Connected Successfully!');

    await sequelize.sync({ alter: true });
    console.log('All Tables Synced!');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
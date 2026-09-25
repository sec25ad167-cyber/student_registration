const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const localStudents = [];
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_registration';

app.use(cors());
app.use(express.json());

const studentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    rollNo: { type: String, required: true },
    bloodGroup: String,
    age: Number,
    dob: String,
    email: { type: String, required: true },
    address: String,
    department: String,
    course: String,
    gender: String,
    year: String,
    section: String,
    backlogs: Number,
    selectedCompanies: [String],
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

app.get('/', (req, res) => {
  res.json({ message: 'API is live' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/register', (req, res) => {
  res.status(405).json({
    message: 'Use POST /api/register to submit a student registration.',
  });
});

app.get('/api/students', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.json(students);
    }

    return res.json(localStudents);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch students', error: error.message });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const students = mongoose.connection.readyState === 1 ? await Student.find().sort({ createdAt: -1 }) : localStudents;
    const grouped = {};

    students.forEach((student) => {
      const companies = Array.isArray(student.selectedCompanies) && student.selectedCompanies.length > 0
        ? student.selectedCompanies
        : ['No company selected'];

      companies.forEach((company) => {
        if (!grouped[company]) grouped[company] = [];
        grouped[company].push(student);
      });
    });

    return res.json(grouped);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load registrations', error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const payload = req.body || {};
  const {
    studentName,
    rollNo,
    bloodGroup,
    age,
    dob,
    email,
    address,
    department,
    course,
    gender,
    year,
    section,
    backlogs,
    selectedCompanies = [],
  } = payload;

  if (!studentName || !rollNo || !email || !department || !course) {
    return res.status(400).json({ message: 'Student name, roll number, email, department and course are required.' });
  }

  const cleanedPayload = {
    studentName,
    rollNo,
    bloodGroup,
    age: Number(age),
    dob,
    email,
    address,
    department,
    course,
    gender,
    year,
    section,
    backlogs: Number(backlogs || 0),
    selectedCompanies: Array.isArray(selectedCompanies) ? selectedCompanies.slice(0, 4) : [],
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const student = await Student.create(cleanedPayload);
      return res.status(201).json({
        message: 'Registration successful and saved to MongoDB.',
        student,
      });
    }

    localStudents.unshift(cleanedPayload);
    return res.status(201).json({
      message: 'Registration saved locally. Update your MongoDB URL to persist data in the database.',
      student: cleanedPayload,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Close the stale server and try again.`);
      process.exit(1);
    }

    console.error('Server error:', error.message);
    process.exit(1);
  });

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message);
  }
};

startServer();

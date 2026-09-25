import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

const MNC_COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini', 'HCL', 'Tech Mahindra', 'IBM', 'Microsoft']

const initialForm = {
  studentName: '',
  rollNo: '',
  bloodGroup: '',
  age: '',
  dob: '',
  email: '',
  address: '',
  department: '',
  course: '',
  gender: '',
  year: '',
  section: '',
  backlogs: '0',
}

function App() {
  const [registrations, setRegistrations] = useState({})

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('https://student-registration-jvg8.onrender.com/api/registrations')
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error('Unable to load registrations:', error)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <span className="brand-mark">S</span>
            <div>
              <p className="brand-label">Student Portal</p>
              <h2>Registration System</h2>
            </div>
          </div>

          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Student Form
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Admin View
            </NavLink>
          </nav>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<StudentRegistrationPage onRefresh={fetchRegistrations} />} />
            <Route path="/admin" element={<AdminDashboardPage registrations={registrations} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function StudentRegistrationPage({ onRefresh }) {
  const [form, setForm] = useState(initialForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanyToggle = (company) => {
    setSelectedCompanies((prev) => {
      if (prev.includes(company)) {
        return prev.filter((item) => item !== company)
      }

      if (prev.length >= 4) {
        return [...prev.slice(1), company]
      }

      return [...prev, company]
    })
  }

  const handleContinue = () => {
    if (Number(form.backlogs) === 0) {
      setStep(2)
      return
    }

    handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    try {
      const payload = {
        ...form,
        backlogs: Number(form.backlogs),
        selectedCompanies: Number(form.backlogs) === 0 ? selectedCompanies : [],
      }

      const response = await fetch('https://student-registration-jvg8.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setMessage(data.message)
      setForm(initialForm)
      setSelectedCompanies([])
      setStep(1)
      onRefresh()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">Join now</p>
        <h1>Student Registration Portal</h1>
        <p className="subtext">Create your engineering student profile and apply for preferred companies.</p>
      </div>

      {step === 1 && (
        <form className="student-form" onSubmit={(event) => event.preventDefault()}>
          <div className="field-grid">
            <label>
              Student Name
              <input name="studentName" value={form.studentName} onChange={handleChange} required />
            </label>

            <label>
              Roll No
              <input name="rollNo" value={form.rollNo} onChange={handleChange} required />
            </label>

            <label>
              Blood Group
              <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required />
            </label>

            <label>
              Age
              <input type="number" name="age" value={form.age} onChange={handleChange} required />
            </label>

            <label>
              Date of Birth
              <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
            </label>

            <label>
              Email ID
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label className="full-width">
              Address
              <textarea name="address" value={form.address} onChange={handleChange} rows="3" required />
            </label>

            <label>
              Department of Engineering
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Civil">Civil</option>
                <option value="Electronics">Electronics</option>
              </select>
            </label>

            <label>
              Course
              <select name="course" value={form.course} onChange={handleChange} required>
                <option value="">Select course</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="Diploma">Diploma</option>
              </select>
            </label>

            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Year
              <select name="year" value={form.year} onChange={handleChange} required>
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </label>

            <label>
              Section
              <input name="section" value={form.section} onChange={handleChange} required />
            </label>

            <label>
              Number of Backlogs
              <select name="backlogs" value={form.backlogs} onChange={handleChange} required>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="primary-btn" onClick={handleContinue} disabled={loading}>
              {Number(form.backlogs) === 0 ? 'Next: Choose Companies' : 'Register'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="company-step">
          <h2>Select four MNCs</h2>
          <p>Choose four preferred companies from the list below.</p>

          <div className="company-grid">
            {MNC_COMPANIES.map((company) => {
              const isSelected = selectedCompanies.includes(company)
              return (
                <button
                  key={company}
                  type="button"
                  className={`company-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCompanyToggle(company)}
                >
                  {company}
                </button>
              )
            })}
          </div>

          <div className="selection-count">Selected: {selectedCompanies.length}/4</div>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="primary-btn" onClick={handleSubmit} disabled={loading || selectedCompanies.length !== 4}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </div>
      )}

      {message && <p className="status-message">{message}</p>}
    </section>
  )
}

function AdminDashboardPage({ registrations }) {
  return (
    <section className="admin-card">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin mode</p>
          <h2>Company-wise registrations</h2>
        </div>
      </div>

      <div className="company-summary">
        {Object.keys(registrations).length === 0 ? (
          <div className="empty-state">No registrations yet.</div>
        ) : (
          Object.entries(registrations).map(([company, students]) => (
            <div key={company} className="company-group">
              <h3>{company}</h3>
              <ul>
                {students.map((student) => (
                  <li key={`${company}-${student.rollNo || student.email}`}>
                    <span>{student.studentName || student.name}</span>
                    <span>{student.rollNo}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default App

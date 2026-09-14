import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])

  // Form states
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskProjectId, setNewTaskProjectId] = useState('')

  const api = axios.create({
    baseURL: '/api'
  })

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      refreshData()
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const refreshData = () => {
    fetchDashboard()
    fetchProjects()
    fetchTasks()
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      
      const res = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      const access_token = res.data.access_token
      setToken(access_token)
      localStorage.setItem('token', access_token)
    } catch (err) {
      alert('Login failed. Ensure backend is running and you use admin/admin123')
    }
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setDashboard(null)
    setProjects([])
    setTasks([])
  }

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/summary')
      setDashboard(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/')
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/')
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      await api.post('/projects/', {
        name: newProjectName,
        description: newProjectDesc,
        status: 'active'
      })
      setNewProjectName('')
      setNewProjectDesc('')
      refreshData()
    } catch (err) {
      alert('Failed to create project')
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      refreshData()
    } catch (err) {
      alert('Failed to delete project')
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskProjectId) {
      alert('Please select a project first')
      return
    }
    try {
      await api.post('/tasks/', {
        title: newTaskTitle,
        description: newTaskDesc,
        project_id: parseInt(newTaskProjectId),
        status: 'todo',
        priority: 'medium'
      })
      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskProjectId('')
      refreshData()
    } catch (err) {
      alert('Failed to create task')
    }
  }

  const handleCompleteTask = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: 'done'
      })
      refreshData()
    } catch (err) {
      alert('Failed to update task')
    }
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      refreshData()
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  if (!token) {
    return (
      <div className="container login-container">
        <h2>Task Management Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e)=>setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            required 
          />
          <button type="submit">Login</button>
        </form>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Task Management Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      {dashboard && (
        <div className="dashboard-summary">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p>{dashboard.total_projects}</p>
          </div>
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{dashboard.total_tasks}</p>
          </div>
        </div>
      )}

      <div className="sections-grid">
        <div className="projects-section">
          <h2>Your Projects</h2>
          
          <form className="add-form" onSubmit={handleCreateProject}>
            <input type="text" placeholder="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
            <input type="text" placeholder="Description" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} required />
            <button type="submit" className="add-btn">+ Add Project</button>
          </form>

          {projects.length === 0 ? <p>No projects found.</p> : (
            <ul className="project-list">
              {projects.map(p => (
                <li key={p.id} className="project-item">
                  <div className="item-header">
                    <h3>{p.name}</h3>
                    <button className="del-btn" onClick={() => handleDeleteProject(p.id)}>X</button>
                  </div>
                  <p>{p.description}</p>
                  <span className="status badge">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tasks-section">
          <h2>Your Tasks</h2>
          
          <form className="add-form" onSubmit={handleCreateTask}>
            <input type="text" placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
            <input type="text" placeholder="Description" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} required />
            <select value={newTaskProjectId} onChange={e => setNewTaskProjectId(e.target.value)} required>
              <option value="">-- Select a Project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button type="submit" className="add-btn">+ Add Task</button>
          </form>

          {tasks.length === 0 ? <p>No tasks found.</p> : (
            <ul className="project-list">
              {tasks.map(t => (
                <li key={t.id} className="project-item">
                  <div className="item-header">
                    <h3>{t.title}</h3>
                    <button className="del-btn" onClick={() => handleDeleteTask(t.id)}>X</button>
                  </div>
                  <p>{t.description}</p>
                  <div className="task-badges">
                    <span className={t.status === 'done' ? "status badge done-badge" : "status badge"}>{t.status}</span>
                    <span className="priority badge priority-badge">{t.priority} priority</span>
                  </div>
                  {t.status !== 'done' && (
                    <button className="complete-btn" onClick={() => handleCompleteTask(t)}>✓ Mark Complete</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

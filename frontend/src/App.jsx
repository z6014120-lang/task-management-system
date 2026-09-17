import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import './App.css'

const api = axios.create({
  baseURL: '/api'
})

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [currentUser, setCurrentUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])

  const [activeModal, setActiveModal] = useState(null)
  const [expandedProjects, setExpandedProjects] = useState({})
  const [expandedTasks, setExpandedTasks] = useState({})
  const [taskComments, setTaskComments] = useState({})
  const [newCommentContent, setNewCommentContent] = useState({})
  const [notifications, setNotifications] = useState([])
  const [showNotifMenu, setShowNotifMenu] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/')
      setNotifications(res.data)
    } catch(e) {}
  }

  const markNotifRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchNotifications()
    } catch(e) {}
  }

  const toggleProject = (id) => setExpandedProjects(prev => ({...prev, [id]: !prev[id]}))
  
  const fetchComments = async (taskId) => {
    try {
      const res = await api.get(`/comments/task/${taskId}`)
      setTaskComments(prev => ({...prev, [taskId]: res.data}))
    } catch (err) {
      console.error(err)
    }
  }

  const toggleTask = (id) => {
    const isExpanding = !expandedTasks[id]
    setExpandedTasks(prev => ({...prev, [id]: isExpanding}))
    if (isExpanding) {
      fetchComments(id)
    }
  }

  const handleAddComment = async (e, taskId) => {
    e.preventDefault()
    if (!newCommentContent[taskId]) return
    try {
      await api.post('/comments/', {
        content: newCommentContent[taskId],
        task_id: taskId
      })
      setNewCommentContent(prev => ({...prev, [taskId]: ''}))
      fetchComments(taskId)
    } catch (err) {
      alert('Failed to add comment')
    }
  }

  // Form states
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskProjectId, setNewTaskProjectId] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('')

  const [newEmpUsername, setNewEmpUsername] = useState('')
  const [newEmpEmail, setNewEmpEmail] = useState('')
  const [newEmpPassword, setNewEmpPassword] = useState('')

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchCurrentUser()
      refreshData()
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/users/me')
      setCurrentUser(res.data)
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateEmployee = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/', {
        username: newEmpUsername,
        email: newEmpEmail,
        password: newEmpPassword,
        role: 'employee'
      })
      alert('Employee Account Created Successfully!')
      setNewEmpUsername('')
      setNewEmpEmail('')
      setNewEmpPassword('')
      setActiveModal(null)
      fetchUsers()
    } catch (err) {
      alert('Failed to create employee')
    }
  }

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
    setCurrentUser(null)
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
      setActiveModal(null)
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
    const payload = {
      title: newTaskTitle,
      description: newTaskDesc,
      project_id: parseInt(newTaskProjectId),
      status: 'todo',
      priority: 'medium'
    }
    if (newTaskAssigneeId) {
      payload.assignee_id = parseInt(newTaskAssigneeId)
    } else if (currentUser) {
      payload.assignee_id = currentUser.id
    }

    try {
      await api.post('/tasks/', payload)
      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskProjectId('')
      setNewTaskAssigneeId('')
      setActiveModal(null)
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

  const handleFileUpload = async (e, taskId) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      await api.post(`/tasks/${taskId}/upload`, formData)
      refreshData()
    } catch (err) {
      alert('Failed to upload file')
    }
  }

  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div style={{textAlign: 'center', marginBottom: '25px'}}>
            <h2 style={{margin: '0 0 8px 0', fontSize: '1.8rem', color: '#111827'}}>Sign In</h2>
            <p style={{color: '#6B7280', fontSize: '14px', margin: 0}}>Access your Task Management Dashboard</p>
          </div>
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
            <button type="submit" className="signin-btn">Sign In</button>
          </form>
          <div style={{marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#6B7280'}}>
            <p style={{margin: '0 0 8px 0', fontWeight: 'bold', color: '#9CA3AF'}}>Demo Accounts</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
              <span><b>Admin:</b> admin (admin123)</span>
              <span><b>Employee 1:</b> ali_employee (ali123)</span>
              <span><b>Employee 2:</b> zoya (zoya123)</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = currentUser?.role === 'admin'

  const statusData = [
    { name: 'Incomplete', value: tasks.filter(t => t.status !== 'done').length },
    { name: 'Complete', value: tasks.filter(t => t.status === 'done').length }
  ]
  const COLORS = ['#F59E0B', '#10B981']

  const employeeStats = {}
  users.forEach(u => {
    employeeStats[u.id] = { name: u.username, Complete: 0, Incomplete: 0 }
  })
  
  tasks.forEach(t => {
    if (t.assignee_id && employeeStats[t.assignee_id]) {
      if (t.status === 'done') {
        employeeStats[t.assignee_id].Complete += 1;
      } else {
        employeeStats[t.assignee_id].Incomplete += 1;
      }
    }
  })
  
  const employeeChartData = Object.values(employeeStats).filter(e => e.Complete > 0 || e.Incomplete > 0)

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Task Management</h1>
          {currentUser && (
            <div style={{marginTop: '5px', fontSize: '1.1rem', opacity: 0.9}}>
              Welcome {currentUser.role === 'admin' ? 'Admin' : 'Employee'}
            </div>
          )}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '25px', position: 'relative'}}>
          
          {/* Notification Bell */}
          <div 
            style={{
              position: 'relative', 
              cursor: 'pointer', 
              padding: '10px', 
              background: '#F9FAFB', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s'
            }} 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span style={{position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', border: '2px solid white', padding: '0 4px'}}>
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </div>

          {/* User Profile & Logout */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px'}}>
            {currentUser && (
              <div style={{fontSize: '0.85rem', color: '#6B7280'}}>
                Signed in as <b style={{color: '#111827'}}>{currentUser.username}</b>
              </div>
            )}
            <button onClick={handleLogout} className="logout-btn" style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', transition: 'background 0.2s'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </div>
          
          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div style={{position: 'absolute', top: '55px', right: '0', background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '320px', zIndex: 100, maxHeight: '400px', overflowY: 'auto'}}>
              <h4 style={{margin: 0, padding: '15px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', borderRadius: '12px 12px 0 0', fontSize: '1rem', color: '#111827'}}>Notifications</h4>
              {notifications.length === 0 ? (
                <div style={{padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem'}}>No new notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => markNotifRead(n.id)} style={{padding: '15px', borderBottom: '1px solid #F3F4F6', background: n.is_read ? 'white' : '#EFF6FF', cursor: 'pointer', transition: 'background 0.2s'}}>
                    <p style={{margin: '0 0 5px 0', fontSize: '0.9rem', color: '#374151', fontWeight: n.is_read ? 'normal' : '600'}}>{n.message}</p>
                    <span style={{fontSize: '0.75rem', color: '#9CA3AF'}}>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      {dashboard && (
        <div style={{marginBottom: '40px'}}>
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
        </div>
      )}

      {isAdmin && (
        <div className="action-buttons">
          <button className="action-btn" onClick={() => setActiveModal('project')}>+ New Project</button>
          <button className="action-btn" onClick={() => setActiveModal('task')}>+ Assign Task</button>
          <button className="action-btn" onClick={() => setActiveModal('employee')}>Add Employee</button>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'project' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="add-form" style={{boxShadow:'none', padding:0, border:'none'}} onSubmit={handleCreateProject}>
              <input type="text" placeholder="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
              <input type="text" placeholder="Description" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} required />
              <button type="submit" className="add-btn">+ Create Project</button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'task' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign New Task</h2>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="add-form" style={{boxShadow:'none', padding:0, border:'none'}} onSubmit={handleCreateTask}>
              <input type="text" placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
              <input type="text" placeholder="Description" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} required />
              <select value={newTaskProjectId} onChange={e => setNewTaskProjectId(e.target.value)} required>
                <option value="">-- Select a Project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={newTaskAssigneeId} onChange={e => setNewTaskAssigneeId(e.target.value)}>
                <option value="">-- Assign to Employee (Optional) --</option>
                {users.map(u => <option key={u.id} value={u.id}>ID: {u.id} - {u.username} ({u.role})</option>)}
              </select>
              <button type="submit" className="add-btn">+ Assign Task</button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'employee' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Employee Account</h2>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="add-form" style={{boxShadow:'none', padding:0, border:'none'}} onSubmit={handleCreateEmployee}>
              <input type="text" placeholder="Username (e.g. jhon_doe)" value={newEmpUsername} onChange={e => setNewEmpUsername(e.target.value)} required />
              <input type="email" placeholder="Email Address" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={newEmpPassword} onChange={e => setNewEmpPassword(e.target.value)} required />
              <button type="submit" className="add-btn">+ Create Account</button>
            </form>
          </div>
        </div>
      )}

      <div className="sections-grid">
        <div className="projects-section">
          <h2 style={{borderBottom: '2px solid #E5E7EB', paddingBottom: '10px'}}>Projects List</h2>

          {projects.length === 0 ? <p>No projects found.</p> : (
            <ul className="project-list">
              {projects.map(p => (
                <li key={p.id} className="project-item" style={{
                  borderLeft: '4px solid #14B8A6',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div className="item-header" onClick={() => toggleProject(p.id)} style={{cursor: 'pointer', paddingBottom: expandedProjects[p.id] ? '15px' : '0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{fontSize: '12px', color: '#6B7280'}}>{expandedProjects[p.id] ? '▼' : '▶'}</span>
                      <h3 style={{margin: 0}}>{p.name}</h3>
                    </div>
                    {isAdmin && <button className="del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}>X</button>}
                  </div>
                  
                  {expandedProjects[p.id] && (
                    <div style={{borderTop: '1px solid #E5E7EB', paddingTop: '15px'}}>
                      <p>{p.description}</p>
                      <span className="status badge">{p.status}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tasks-section">
          <h2 style={{borderBottom: '2px solid #E5E7EB', paddingBottom: '10px'}}>Tasks List</h2>

          {tasks.length === 0 ? <p>No tasks found.</p> : (
            <ul className="project-list">
              {tasks.map(t => (
                <li key={t.id} className="project-item" style={{
                  borderLeft: t.status === 'done' ? '4px solid #10B981' : '4px solid #F59E0B',
                  backgroundColor: t.status === 'done' ? '#F0FDF4' : '#FFFBEB',
                  opacity: t.status === 'done' ? 0.85 : 1
                }}>
                  <div className="item-header" onClick={() => toggleTask(t.id)} style={{cursor: 'pointer', paddingBottom: expandedTasks[t.id] ? '15px' : '0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{fontSize: '12px', color: '#6B7280'}}>{expandedTasks[t.id] ? '▼' : '▶'}</span>
                      <h3 style={{margin: 0, color: t.status === 'done' ? '#065F46' : '#92400E', textDecoration: t.status === 'done' ? 'line-through' : 'none'}}>
                        {t.title}
                      </h3>
                    </div>
                    {isAdmin && <button className="del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteTask(t.id); }}>X</button>}
                  </div>
                  
                  {expandedTasks[t.id] && (
                    <div style={{borderTop: t.status === 'done' ? '1px solid #A7F3D0' : '1px solid #FDE68A', paddingTop: '15px'}}>
                      <p style={{color: t.status === 'done' ? '#065F46' : '#92400E'}}>{t.description}</p>
                      
                      {isAdmin && t.assignee_id && (
                        <p style={{fontSize: '0.85em', color: t.status === 'done' ? '#047857' : '#B45309', fontWeight: 'bold'}}>
                          Assigned to: {users.find(u => u.id === t.assignee_id)?.username || `User ID ${t.assignee_id}`}
                        </p>
                      )}

                      <div className="task-badges">
                        <span className={t.status === 'done' ? "status badge done-badge" : "status badge"} style={{backgroundColor: t.status === 'done' ? '#D1FAE5' : '#FEF3C7', color: t.status === 'done' ? '#065F46' : '#92400E'}}>{t.status}</span>
                        <span className="priority badge priority-badge" style={{backgroundColor: '#FFE4E6', color: '#9F1239'}}>{t.priority} priority</span>
                      </div>

                      {t.attachment_url ? (
                        <div style={{marginTop: '15px'}}>
                          <a href={`http://localhost:8000${t.attachment_url}`} target="_blank" rel="noreferrer" style={{color: t.status === 'done' ? '#047857' : '#B45309', textDecoration: 'none', fontWeight: 'bold'}}>
                            View Attachment
                          </a>
                        </div>
                      ) : (
                        <div style={{marginTop: '15px'}}>
                          <label style={{fontSize: '0.85em', color: '#666', cursor: 'pointer', background: 'rgba(255,255,255,0.5)', padding: '6px 12px', borderRadius: '6px', border: t.status === 'done' ? '1px solid #A7F3D0' : '1px solid #FDE68A'}}>
                            Attach File
                            <input type="file" style={{display: 'none'}} onChange={(e) => handleFileUpload(e, t.id)} />
                          </label>
                        </div>
                      )}

                      {t.status !== 'done' && (
                        <button className="complete-btn" onClick={() => handleCompleteTask(t)} style={{backgroundColor: '#10B981', marginTop: '20px'}}>Mark Complete</button>
                      )}

                      <div className="comments-section" style={{marginTop: '25px', paddingTop: '15px', borderTop: '1px dashed #E5E7EB'}}>
                        <h4 style={{margin: '0 0 15px 0', fontSize: '0.95rem', color: '#374151'}}>Comments</h4>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px'}}>
                          {taskComments[t.id]?.length > 0 ? (
                            taskComments[t.id].map(c => (
                              <div key={c.id} style={{background: 'rgba(243, 244, 246, 0.5)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                  <b style={{color: '#111827'}}>{users.find(u => u.id === c.author_id)?.username || `User ${c.author_id}`}</b>
                                  <span style={{fontSize: '0.75rem', color: '#9CA3AF'}}>{new Date(c.created_at).toLocaleString()}</span>
                                </div>
                                <div style={{color: '#4B5563'}}>{c.content}</div>
                              </div>
                            ))
                          ) : (
                            <p style={{margin: 0, fontSize: '0.85rem', color: '#9CA3AF'}}>No comments yet.</p>
                          )}
                        </div>

                        <form onSubmit={(e) => handleAddComment(e, t.id)} style={{display: 'flex', gap: '10px'}}>
                          <input 
                            type="text" 
                            placeholder="Write a comment..." 
                            value={newCommentContent[t.id] || ''} 
                            onChange={e => setNewCommentContent(prev => ({...prev, [t.id]: e.target.value}))}
                            style={{flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', outline: 'none'}}
                          />
                          <button type="submit" style={{padding: '8px 15px', background: '#14B8A6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Post</button>
                        </form>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {dashboard && (
        <div style={{marginTop: '50px', paddingTop: '40px', borderTop: '2px dashed #E5E7EB', marginBottom: '40px'}}>
          <h2 style={{textAlign: 'center', marginBottom: '40px', color: '#111827', fontSize: '1.8rem', fontWeight: '700'}}>Analytics Overview</h2>
          <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center'}}>
            
            {/* Beautiful Donut Chart for All Tasks */}
            <div style={{flex: '1 1 400px', maxWidth: '550px', background: 'linear-gradient(145deg, #ffffff, #f9fafb)', padding: '35px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', border: '1px solid rgba(229, 231, 235, 0.6)'}}>
              <h3 style={{margin: '0 0 25px 0', fontSize: '1.2rem', color: '#374151', textAlign: 'center', fontWeight: '600'}}>Total Tasks: Complete vs Incomplete</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={85} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={12} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.name === 'Complete' ? '#10B981' : '#F59E0B'} style={{filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.12))'}} />)}
                  </Pie>
                  <ChartTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', padding: '12px 20px', fontWeight: 'bold'}} />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '25px', fontSize: '1rem', fontWeight: '500', color: '#4B5563'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Employee Bar Chart */}
            <div style={{flex: '1 1 400px', maxWidth: '550px', background: 'linear-gradient(145deg, #ffffff, #f9fafb)', padding: '35px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', border: '1px solid rgba(229, 231, 235, 0.6)'}}>
              <h3 style={{margin: '0 0 25px 0', fontSize: '1.2rem', color: '#374151', textAlign: 'center', fontWeight: '600'}}>Employee Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeChartData} margin={{top: 20, right: 20, left: -20, bottom: 0}} barSize={35}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{fontSize: 14, fill: '#6B7280', fontWeight: '500'}} axisLine={false} tickLine={false} dy={15} />
                  <YAxis tick={{fontSize: 13, fill: '#9CA3AF'}} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                  <ChartTooltip cursor={{fill: 'rgba(243, 244, 246, 0.8)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', padding: '12px 20px', fontWeight: 'bold'}} />
                  <Legend wrapperStyle={{paddingTop: '20px', fontSize: '1rem', fontWeight: '500', color: '#4B5563'}} />
                  <Bar dataKey="Incomplete" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Incomplete Tasks" />
                  <Bar dataKey="Complete" fill="#10B981" radius={[6, 6, 0, 0]} name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}

export default App

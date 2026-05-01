import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('joblinked_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [dbReady, setDbReady] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    setDbReady(true);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        if (role !== 'admin') {
          localStorage.setItem('joblinked_user', JSON.stringify(data.user));
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection error. Make sure server is running.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('joblinked_user');
  };

  const registerUser = async (email, password, fullName, phone, barangay) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone, barangay })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Connection error. Make sure server is running.' };
    }
  };

  const registerEmployer = async (companyName, email, password, address, industry, contactPerson, businessPermit) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/employer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password, address, industry, contactPerson, businessPermit })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Connection error. Make sure server is running.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, login, registerUser, registerEmployer, dbReady, dbError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const api = {
  getJobs: async () => {
    const res = await fetch(`${API_URL}/jobs`);
    return res.json();
  },
  
  getJobsByEmployer: async (employerId) => {
    const res = await fetch(`${API_URL}/jobs/${employerId}`);
    return res.json();
  },
  
  createJob: async (job) => {
    const res = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    return res.json();
  },
  
  deleteJob: async (id) => {
    const res = await fetch(`${API_URL}/jobs/${id}`, { method: 'DELETE' });
    return res.json();
  },
  
  getApplications: async () => {
    const res = await fetch(`${API_URL}/applications`);
    return res.json();
  },
  
  getApplicationsByUser: async (userId) => {
    const res = await fetch(`${API_URL}/applications/user/${userId}`);
    return res.json();
  },
  
  getApplicationsByJob: async (jobId) => {
    const res = await fetch(`${API_URL}/applications/job/${jobId}`);
    return res.json();
  },
  
  getApplicationsByEmployer: async (employerId) => {
    const res = await fetch(`${API_URL}/applications/employer/${employerId}`);
    return res.json();
  },
  
  createApplication: async (jobId, userId) => {
    const res = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, userId })
    });
    return res.json();
  },
  
  updateApplicationStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },
  
  deleteApplication: async (id) => {
    const res = await fetch(`${API_URL}/applications/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  
  getStats: async () => {
    const res = await fetch(`${API_URL}/stats`);
    return res.json();
  },
  
  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },
  
  getAllEmployers: async () => {
    const res = await fetch(`${API_URL}/employers`);
    return res.json();
  },
  
  updateEmployerStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/employers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },
  
  updateJobStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/jobs/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
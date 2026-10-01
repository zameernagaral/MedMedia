import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Mail, Lock, User } from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', { 
        email, password, fullName, username, role 
      }, { withCredentials: true });
      
      if (res.data.success) {
          localStorage.setItem('medmedia_theme_prompt_pending', 'true');
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-teal-600">
          <HeartPulse size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create MedMedia Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">I am a...</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border">
                <option value="STUDENT">Medical Student</option>
                <option value="DOCTOR">Doctor</option>
                <option value="INSTITUTION">Institution/Hospital</option>
              </select>
            </div>

            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">
              Register
            </button>
          </form>
          
          <div className="mt-6">
            <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

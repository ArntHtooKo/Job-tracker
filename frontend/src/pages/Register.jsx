import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Email might be in use.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="First Name" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
          <input type="text" placeholder="Last Name" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
          <input type="email" placeholder="Email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
          <input type="password" placeholder="Password" required onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Register</button>
        </form>
        <p className="mt-4 text-center text-sm">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Briefcase, Building2, Calendar, CheckCircle2, XCircle, Clock, Trash2, Upload, Search, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({ companyName: '', jobTitle: '', status: 'APPLIED' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get('/applications');
      setApplications(response.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/applications', formData);
      setFormData({ companyName: '', jobTitle: '', status: 'APPLIED' });
      fetchApplications();
    } catch (err) {
      console.error("Failed to add application", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await apiClient.delete(`/applications/${id}`);
      fetchApplications();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleStatusChange = async (app, newStatus) => {
    try {
      const updatedApp = { ...app, status: newStatus };
      await apiClient.put(`/applications/${app.id}`, updatedApp);
      fetchApplications();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleFileUpload = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post(`/applications/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchApplications();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file.");
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(app => app.status === 'APPLIED').length,
    interviews: applications.filter(app => app.status === 'INTERVIEW').length,
    offers: applications.filter(app => app.status === 'OFFER').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  };

  const filteredApplications = applications.filter(app => 
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">JobTracker</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Apps', value: stats.total, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Applied', value: stats.applied, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Interviews', value: stats.interviews, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Offers', value: stats.offers, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Application Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Application</h2>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Company Name (e.g. Google)" required value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
            <input type="text" placeholder="Job Title (e.g. Frontend Dev)" required value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer">
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="REJECTED">Rejected</option>
              <option value="OFFER">Offer</option>
            </select>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors shadow-sm">
              Add Application
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search applications by company or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm"
          />
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">CV</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td></tr>
              ) : filteredApplications.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">No applications found. Add one above!</td></tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{app.companyName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{app.jobTitle}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={app.status} 
                        onChange={(e) => handleStatusChange(app, e.target.value)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer focus:outline-none appearance-none transition-colors
                          ${app.status === 'APPLIED' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            app.status === 'INTERVIEW' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                            app.status === 'OFFER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            'bg-rose-50 text-rose-700 border-rose-100'}`}
                      >
                        <option value="APPLIED">APPLIED</option>
                        <option value="INTERVIEW">INTERVIEW</option>
                        <option value="OFFER">OFFER</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {app.appliedDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {app.cvFileName ? (
                        <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Uploaded</span>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100">
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                          <input type="file" className="hidden" onChange={(e) => { if (e.target.files[0]) handleFileUpload(app.id, e.target.files[0]); }} />
                        </label>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(app.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
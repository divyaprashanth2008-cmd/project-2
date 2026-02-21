import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Upload, 
  Search, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { analyzeResume, ResumeAnalysis } from './services/geminiService';

// --- Types ---
interface Resume {
  id: string;
  candidate_name: string;
  content: string;
  score: number;
  analysis: ResumeAnalysis;
  job_id: string;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'jobs', icon: FileText, label: 'Job Roles' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-6 flex flex-col fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
          <Zap className="text-white fill-current" size={24} />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">TalentPulse <span className="text-indigo-400">AI</span></h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-slate-800 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="text-indigo-400" size={16} />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">AI Engine</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">Powered by Gemini 3.1 Pro for high-precision screening.</p>
      </div>
    </div>
  );
};

const Dashboard = ({ resumes, onDelete }: { resumes: Resume[], onDelete: (id: string) => void }) => {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Users size={24} />
            </div>
            <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Resumes</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-1">{resumes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">High Match</span>
          </div>
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Shortlisted</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-1">
            {resumes.filter(r => r.score >= 80).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
              <AlertCircle size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Avg. Score</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-1">
            {resumes.length > 0 ? Math.round(resumes.reduce((acc, r) => acc + r.score, 0) / resumes.length) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-bottom border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Candidate Rankings</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Recommendation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resumes.map((resume) => (
                <tr key={resume.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {resume.candidate_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{resume.candidate_name}</p>
                        <p className="text-xs text-slate-500">ID: {resume.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden">
                        <span className="text-sm font-bold text-slate-900 z-10">{resume.score}%</span>
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-indigo-500 transition-all duration-1000" 
                          style={{ height: `${resume.score}%`, opacity: 0.2 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      resume.analysis.recommendation === 'Strong Hire' ? 'bg-emerald-100 text-emerald-700' :
                      resume.analysis.recommendation === 'Potential' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {resume.analysis.recommendation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(resume.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedResume(resume)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <button 
                        onClick={() => onDelete(resume.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {resumes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={48} className="opacity-20" />
                      <p>No resumes screened yet. Start by uploading one!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resume Detail Modal */}
      <AnimatePresence>
        {selectedResume && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResume(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 vibrant-gradient text-white flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-extrabold">{selectedResume.candidate_name}</h2>
                  <p className="text-indigo-100 mt-1 opacity-80">Candidate Analysis Report</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black">{selectedResume.score}<span className="text-xl opacity-60">%</span></div>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Match Score</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                  <p className="text-slate-700 leading-relaxed text-lg italic">"{selectedResume.analysis.summary}"</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500" size={18} /> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {selectedResume.analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <XCircle className="text-rose-500" size={18} /> Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                      {selectedResume.analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Skills Matrix</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.analysis.skillsMatch.map((s, i) => (
                      <div key={i} className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                        s.match 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 grayscale'
                      }`}>
                        {s.match ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        <span className="font-bold text-sm">{s.skill}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Experience Alignment</h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed">
                    {selectedResume.analysis.experienceMatch}
                  </div>
                </section>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setSelectedResume(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JobsManager = ({ jobs, onAddJob }: { jobs: Job[], onAddJob: (title: string, desc: string) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Job Roles</h2>
          <p className="text-slate-500">Manage the job descriptions used for AI screening.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{job.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
              {job.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-xs font-bold text-indigo-600">Active Role</span>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <p>No job roles defined yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-extrabold text-slate-900">New Job Role</h2>
                <p className="text-slate-500 text-sm">Define the requirements for AI screening.</p>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Description</label>
                  <textarea 
                    rows={6}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-200 flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onAddJob(title, desc);
                    setIsAdding(false);
                    setTitle('');
                    setDesc('');
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Create Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">System Settings</h2>
        <p className="text-slate-500">Configure your AI screening preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">AI Model</h3>
              <p className="text-sm text-slate-500">Select the intelligence engine for screening.</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Gemini 3.1 Pro (Recommended)</option>
              <option>Gemini 3 Flash (Fast)</option>
              <option>GPT-4o (via API)</option>
            </select>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Strictness Level</h3>
              <p className="text-sm text-slate-500">Adjust how critical the AI is during matching.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Relaxed</span>
              <input type="range" className="w-32 accent-indigo-600" />
              <span className="text-xs font-bold text-slate-400">Strict</span>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Auto-Shortlist</h3>
              <p className="text-sm text-slate-500">Automatically flag candidates above 85%.</p>
            </div>
            <button className="w-12 h-6 bg-indigo-600 rounded-full relative transition-all">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-rose-900">Danger Zone</h3>
            <p className="text-sm text-rose-700">Irreversible actions for your data.</p>
          </div>
          <button className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-sm">
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [resumesRes, jobsRes] = await Promise.all([
      fetch('/api/resumes'),
      fetch('/api/jobs')
    ]);
    const resumesData = await resumesRes.json();
    const jobsData = await jobsRes.json();
    setResumes(resumesData.map((r: any) => ({ ...r, analysis: JSON.parse(r.analysis) })));
    setJobs(jobsData);
    if (jobsData.length > 0) setSelectedJobId(jobsData[0].id);
  };

  const handleAddJob = async (title: string, description: string) => {
    const id = Math.random().toString(36).substring(7);
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, description })
    });
    fetchData();
  };

  const handleDeleteResume = async (id: string) => {
    await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedJobId) return;

    setIsUploading(true);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setUploadProgress(40);

      const job = jobs.find(j => j.id === selectedJobId);
      if (!job) return;

      try {
        const analysis = await analyzeResume(text, job.description);
        setUploadProgress(80);

        const id = Math.random().toString(36).substring(7);
        await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            candidate_name: file.name.split('.')[0].replace(/_/g, ' '),
            content: text,
            score: analysis.score,
            analysis,
            job_id: selectedJobId
          })
        });

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          fetchData();
          setActiveTab('dashboard');
        }, 500);
      } catch (error) {
        console.error("AI Analysis failed:", error);
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' ? 'Recruitment Dashboard' : 
               activeTab === 'jobs' ? 'Job Management' : 'System Settings'}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'dashboard' ? 'Real-time candidate screening and ranking.' : 
               activeTab === 'jobs' ? 'Define and manage your hiring criteria.' : 'Manage your platform configuration.'}
            </p>
          </div>

          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-4">
              <select 
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
                {jobs.length === 0 && <option disabled>No Jobs Created</option>}
              </select>
              
              <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
                <Upload size={20} />
                Screen Resume
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md" />
              </label>
            </div>
          )}
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && <Dashboard resumes={resumes} onDelete={handleDeleteResume} />}
          {activeTab === 'jobs' && <JobsManager jobs={jobs} onAddJob={handleAddJob} />}
          {activeTab === 'settings' && <SettingsPage />}
        </motion.div>
      </main>

      {/* Upload Overlay */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full space-y-6"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="48" cy="48" r="44" 
                    fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-indigo-600 transition-all duration-500"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * uploadProgress) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="text-indigo-600 animate-pulse" size={32} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">AI Screening in Progress</h3>
                <p className="text-slate-500 text-sm mt-2">Our neural engine is analyzing candidate skills and experience...</p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


import React, { useState } from 'react';
import { User, UserRole, Job, Application, Vehicle, Assignment, JobStatus } from '../types';

interface AdminDashboardProps {
  t: any;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  vehicleTypes: string[];
  setVehicleTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  t, users, setUsers, jobs, setJobs, vehicles, setVehicles, applications, setApplications, assignments, setAssignments, vehicleTypes, setVehicleTypes
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'apps' | 'users' | 'vehicles' | 'pending-jobs'>('jobs');
  const [jobForm, setJobForm] = useState({ routeFrom: '', routeTo: '', date: '', time: '', slots: 1, requestedVehicleType: '' });
  const [vehicleForm, setVehicleForm] = useState({ number: '', type: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: UserRole.SUPERVISOR });
  const [newTypeName, setNewTypeName] = useState('');
  
  const [selectedVehicles, setSelectedVehicles] = useState<Record<string, string>>({});

  const addJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      jobId: 'job-' + Date.now(),
      routeFrom: jobForm.routeFrom,
      routeTo: jobForm.routeTo,
      date: jobForm.date,
      time: jobForm.time,
      slotCount: jobForm.slots,
      availableSlots: jobForm.slots,
      status: JobStatus.APPROVED,
      requestedVehicleType: jobForm.requestedVehicleType
    };
    setJobs(prev => [...prev, newJob]);
    setJobForm({ routeFrom: '', routeTo: '', date: '', time: '', slots: 1, requestedVehicleType: '' });
  };

  const approvePendingJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.jobId === jobId ? { ...j, status: JobStatus.APPROVED } : j));
  };

  const denyPendingJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.jobId !== jobId));
  };

  const handleDeleteJob = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (window.confirm("Delete this Job?")) {
      setJobs(prev => prev.filter(j => j.jobId !== jobId));
      setApplications(prev => prev.filter(a => a.jobId !== jobId));
      setAssignments(prev => prev.filter(a => a.jobId !== jobId));
    }
  };

  const addVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.number || !vehicleForm.type) return;
    const newVehicle: Vehicle = {
      vehicleId: 'veh-' + Date.now(),
      number: vehicleForm.number,
      type: vehicleForm.type
    };
    setVehicles(prev => [...prev, newVehicle]);
    setVehicleForm({ number: '', type: '' });
  };

  const handleDeleteVehicle = (e: React.MouseEvent, vehicleId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (window.confirm("Delete this Vehicle?")) {
      setVehicles(prev => prev.filter(v => v.vehicleId !== vehicleId));
    }
  };

  const registerUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.password || !userForm.email) return;
    const newUser: User = { uid: 'user-' + Date.now(), name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role };
    setUsers(prev => [...prev, newUser]);
    setUserForm({ name: '', email: '', password: '', role: UserRole.SUPERVISOR });
  };

  const handleDeleteUser = (e: React.MouseEvent, uid: string) => {
    e.preventDefault(); e.stopPropagation();
    if (uid.startsWith('admin-')) return alert("Cannot remove root Admin.");
    if (window.confirm("Delete this user?")) {
      setUsers(prev => prev.filter(u => u.uid !== uid));
    }
  };

  const addVehicleType = () => {
    if (!newTypeName.trim()) return;
    if (vehicleTypes.includes(newTypeName)) return;
    setVehicleTypes(prev => [...prev, newTypeName.trim()]);
    setNewTypeName('');
  };

  const removeVehicleType = (type: string) => {
    if (window.confirm(`Delete type "${type}"?`)) {
      setVehicleTypes(prev => prev.filter(t => t !== type));
    }
  };

  const approveApplication = (appId: string, jobId: string, supervisorId: string, requestedDriverId?: string) => {
    const driverId = requestedDriverId || users.find(u => u.role === UserRole.DRIVER)?.uid || '';
    const vehicleId = selectedVehicles[appId];

    if (!driverId || !vehicleId) return alert("Please select a vehicle to assign.");

    setApplications(apps => apps.map(a => a.applicationId === appId ? { ...a, status: JobStatus.APPROVED } : a));
    setJobs(js => js.map(j => j.jobId === jobId ? { ...j, availableSlots: 0 } : j));

    const newAssignment: Assignment = {
      assignmentId: 'assign-' + Date.now(),
      jobId, supervisorId, driverId, vehicleId, status: JobStatus.ACCEPTED
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const pendingJobsList = jobs.filter(j => j.status === JobStatus.PENDING);
  const activeJobsList = jobs.filter(j => j.status === JobStatus.APPROVED || !j.status);

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 overflow-x-auto gap-1">
        {(['jobs', 'pending-jobs', 'apps', 'users', 'vehicles'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab === 'jobs' ? t.jobList : tab === 'pending-jobs' ? `Pending (${pendingJobsList.length})` : tab === 'apps' ? t.applications : tab === 'users' ? t.registerUser : t.registerVehicle}
          </button>
        ))}
      </div>

      {activeTab === 'pending-jobs' && (
        <div className="space-y-4">
          {pendingJobsList.length === 0 && <p className="text-center text-slate-600 py-10">No jobs pending approval</p>}
          {pendingJobsList.map(job => (
            <div key={job.jobId} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-lg">{job.routeFrom} → {job.routeTo}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Suggested by {users.find(u => u.uid === job.creatorId)?.name || 'Supervisor'}</p>
                  {job.requestedVehicleType && <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mt-1">Needs: {job.requestedVehicleType}</p>}
               </div>
               <div className="flex gap-2">
                  <button onClick={() => approvePendingJob(job.jobId)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Approve</button>
                  <button onClick={() => denyPendingJob(job.jobId)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Deny</button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <form onSubmit={addJob} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-lg">{t.addJob}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={jobForm.routeFrom} onChange={e => setJobForm({...jobForm, routeFrom: e.target.value})} placeholder={t.from} className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
              <input value={jobForm.routeTo} onChange={e => setJobForm({...jobForm, routeTo: e.target.value})} placeholder={t.to} className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
              <input value={jobForm.date} onChange={e => setJobForm({...jobForm, date: e.target.value})} type="date" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
              <input value={jobForm.time} onChange={e => setJobForm({...jobForm, time: e.target.value})} type="time" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
              <select value={jobForm.requestedVehicleType} onChange={e => setJobForm({...jobForm, requestedVehicleType: e.target.value})} className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none md:col-span-2">
                 <option value="">-- {t.selectVehicle} Type --</option>
                 {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">{t.addJob}</button>
          </form>
          <div className="grid gap-4">
            {activeJobsList.map(job => {
              const assignment = assignments.find(a => a.jobId === job.jobId);
              const isCompleted = assignment?.status === JobStatus.COMPLETED;
              return (
                <div key={job.jobId} className={`bg-slate-900 p-5 rounded-2xl border ${isCompleted ? 'border-green-900/50' : 'border-slate-800'} flex justify-between items-center group transition`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{job.routeFrom} → {job.routeTo}</span>
                      {isCompleted && (
                        <span className="bg-green-950 text-green-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-green-800">Completed</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{job.date} • {job.time}</p>
                    {job.requestedVehicleType && <p className="text-[10px] text-indigo-400 font-bold uppercase">{job.requestedVehicleType}</p>}
                  </div>
                  <button type="button" onClick={(e) => handleDeleteJob(e, job.jobId)} className="bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white p-2 transition rounded-lg border border-red-900/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="space-y-4">
          {applications.length === 0 && <p className="text-center text-slate-600 py-10">No applications received</p>}
          {applications.map(app => {
            const job = jobs.find(j => j.jobId === app.jobId);
            const assignment = assignments.find(a => a.jobId === app.jobId);
            const filteredVehicles = vehicles.filter(v => v.type === job?.requestedVehicleType);

            return (
              <div key={app.applicationId} className={`bg-slate-900 p-5 rounded-2xl border ${assignment?.status === JobStatus.COMPLETED ? 'border-green-900/50' : 'border-slate-800'}`}>
                <div className="flex justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white">Application for {job?.routeFrom} → {job?.routeTo}</h4>
                      <p className="text-xs text-indigo-400 font-bold">Sup: {users.find(u => u.uid === app.supervisorId)?.name}</p>
                      <p className="text-xs text-green-400 font-bold">Driver: {users.find(u => u.uid === (assignment?.driverId || app.requestedDriverId))?.name || 'Default'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700 h-fit uppercase">{app.status}</span>
                      {assignment && (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${assignment.status === JobStatus.COMPLETED ? 'bg-green-950 text-green-400 border-green-800' : 'bg-indigo-950 text-indigo-400 border-indigo-900'}`}>
                          {t[assignment.status as keyof typeof t] || assignment.status}
                        </span>
                      )}
                    </div>
                </div>

                {app.status === JobStatus.PENDING && (
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                       <label className="block text-[10px] text-slate-500 font-black uppercase mb-1">Select Specific Vehicle to Assign</label>
                       <select 
                        value={selectedVehicles[app.applicationId] || ''} 
                        onChange={(e) => setSelectedVehicles({...selectedVehicles, [app.applicationId]: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-xs outline-none"
                       >
                          <option value="">-- {t.selectVehicle} --</option>
                          {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.number} ({v.type})</option>)
                          ) : (
                            vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.number} ({v.type})</option>)
                          )}
                       </select>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveApplication(app.applicationId, app.jobId, app.supervisorId, app.requestedDriverId)} 
                        disabled={!selectedVehicles[app.applicationId]}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${selectedVehicles[app.applicationId] ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-800 text-slate-600'}`}
                      >
                        Approve & Assign
                      </button>
                      <button onClick={() => setApplications(as => as.map(a => a.applicationId === app.applicationId ? {...a, status: JobStatus.DENIED} : a))} className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-lg text-xs font-bold">Deny</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white">{t.manageTypes}</h3>
            <div className="flex gap-2">
              <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} placeholder={t.vehicleType} className="flex-grow bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" />
              <button onClick={addVehicleType} className="bg-slate-800 text-white px-4 rounded-xl text-xs font-bold uppercase">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map(type => (
                <div key={type} className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">
                  <span className="text-xs text-slate-400">{type}</span>
                  <button onClick={() => removeVehicleType(type)} className="text-red-500">×</button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={addVehicle} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white">{t.registerVehicle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={vehicleForm.number} onChange={e => setVehicleForm({...vehicleForm, number: e.target.value})} placeholder={t.vehicleNumber} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
              <select value={vehicleForm.type} onChange={e => setVehicleForm({...vehicleForm, type: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required>
                <option value="">-- {t.selectVehicle} Type --</option>
                {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">{t.registerVehicle}</button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <div key={v.vehicleId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative group">
                <button type="button" onClick={(e) => handleDeleteVehicle(e, v.vehicleId)} className="absolute top-2 right-2 bg-red-950/20 text-red-500 p-1.5 rounded-lg border border-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <p className="font-bold text-white text-sm">{v.number}</p>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{v.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
           <form onSubmit={registerUser} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white">{t.registerUser}</h3>
            <input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder={t.name} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder={t.username} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
              <input value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} type="text" placeholder={t.password} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
            </div>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none">
              <option value={UserRole.SUPERVISOR}>{t.supervisor}</option>
              <option value={UserRole.DRIVER}>{t.driver}</option>
            </select>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">{t.registerUser}</button>
          </form>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
             {users.map(u => (
               <div key={u.uid} className="p-4 flex justify-between items-center group hover:bg-slate-800/20">
                  <div>
                    <p className="font-bold text-white">{u.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{u.role} • {u.email}</p>
                  </div>
                  <button type="button" onClick={(e) => handleDeleteUser(e, u.uid)} className="bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white p-2 transition rounded-lg border border-red-900/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

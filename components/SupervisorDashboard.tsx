
import React, { useState } from 'react';
import { User, Job, Application, Assignment, JobStatus, Vehicle, UserRole } from '../types';

interface SupervisorDashboardProps {
  t: any;
  currentUser: User;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  assignments: Assignment[];
  vehicles: Vehicle[];
  users: User[];
  vehicleTypes: string[];
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ 
  t, currentUser, jobs, setJobs, applications, setApplications, assignments, vehicles, users, vehicleTypes
}) => {
  const [view, setView] = useState<'available' | 'my' | 'create'>('available');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [jobForm, setJobForm] = useState({ routeFrom: '', routeTo: '', date: '', time: '', slots: 1, requestedVehicleType: '' });

  const drivers = users.filter(u => u.role === UserRole.DRIVER);

  const applyForJob = (jobId: string) => {
    if (!selectedDriverId) return alert("Please select a driver first.");
    const job = jobs.find(j => j.jobId === jobId);
    if (!job || job.availableSlots <= 0) return alert("Slot not available");

    const newApp: Application = {
      applicationId: 'app-' + Date.now(),
      jobId,
      supervisorId: currentUser.uid,
      status: JobStatus.PENDING,
      requestedDriverId: selectedDriverId
    };
    setApplications([...applications, newApp]);
    setSelectedDriverId('');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      jobId: 'job-sup-' + Date.now(),
      routeFrom: jobForm.routeFrom,
      routeTo: jobForm.routeTo,
      date: jobForm.date,
      time: jobForm.time,
      slotCount: jobForm.slots,
      availableSlots: jobForm.slots,
      status: JobStatus.PENDING,
      creatorId: currentUser.uid,
      requestedVehicleType: jobForm.requestedVehicleType
    };
    setJobs(prev => [...prev, newJob]);
    setJobForm({ routeFrom: '', routeTo: '', date: '', time: '', slots: 1, requestedVehicleType: '' });
    setView('my');
    alert("Job suggested! Admin needs to approve it.");
  };

  const myApps = applications.filter(a => a.supervisorId === currentUser.uid);
  const mySuggestedJobs = jobs.filter(j => j.creatorId === currentUser.uid);
  const activeJobs = jobs.filter(j => j.status === JobStatus.APPROVED || !j.status);

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 gap-1 overflow-x-auto">
        <button onClick={() => setView('available')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap px-4 ${view === 'available' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
          {t.availableJobs}
        </button>
        <button onClick={() => setView('my')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap px-4 ${view === 'my' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
          My Activity
        </button>
        <button onClick={() => setView('create')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap px-4 ${view === 'create' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500'}`}>
          Suggest Job
        </button>
      </div>

      {view === 'create' && (
        <form onSubmit={handleCreateJob} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white">{t.addJob} (Pending Approval)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={jobForm.routeFrom} onChange={e => setJobForm({...jobForm, routeFrom: e.target.value})} placeholder={t.from} className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
            <input value={jobForm.routeTo} onChange={e => setJobForm({...jobForm, routeTo: e.target.value})} placeholder={t.to} className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
            <input value={jobForm.date} onChange={e => setJobForm({...jobForm, date: e.target.value})} type="date" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
            <input value={jobForm.time} onChange={e => setJobForm({...jobForm, time: e.target.value})} type="time" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
            <select 
              value={jobForm.requestedVehicleType} 
              onChange={e => setJobForm({...jobForm, requestedVehicleType: e.target.value})} 
              className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none md:col-span-2"
              required
            >
               <option value="">-- Select Required Vehicle Type --</option>
               {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Submit Job for Approval</button>
        </form>
      )}

      {view === 'available' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6">
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">1. First, Select a Driver to assign</label>
            <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none">
               <option value="">-- Choose Driver --</option>
               {drivers.map(d => <option key={d.uid} value={d.uid}>{d.name}</option>)}
            </select>
          </div>
          {activeJobs.map(job => {
            const alreadyApplied = myApps.find(a => a.jobId === job.jobId);
            return (
              <div key={job.jobId} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                   <h4 className="font-bold text-white text-xl">{job.routeFrom} → {job.routeTo}</h4>
                   <p className="text-slate-500 text-xs font-semibold">{job.date} • {job.time}</p>
                   {job.requestedVehicleType && <span className="text-[10px] bg-slate-800 text-indigo-400 border border-slate-700 px-2 py-0.5 rounded font-black uppercase mt-2 inline-block">{job.requestedVehicleType}</span>}
                </div>
                <button 
                  onClick={() => applyForJob(job.jobId)}
                  disabled={!!alreadyApplied || !selectedDriverId || job.availableSlots <= 0}
                  className={`w-full md:w-auto px-8 py-3 rounded-xl text-sm font-black uppercase transition-all ${alreadyApplied ? 'bg-slate-800 text-slate-500' : (!selectedDriverId ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}
                >
                  {alreadyApplied ? t[alreadyApplied.status as keyof typeof t] : (job.availableSlots > 0 ? (selectedDriverId ? t.apply : "Select Driver First") : t.noSlots)}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {view === 'my' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">Job Applications & Progress</h3>
            <div className="space-y-4">
              {myApps.map(app => {
                const job = jobs.find(j => j.jobId === app.jobId);
                const assignment = assignments.find(a => a.jobId === app.jobId);
                const isCompleted = assignment?.status === JobStatus.COMPLETED;

                return (
                  <div key={app.applicationId} className={`bg-slate-900 p-6 rounded-2xl border ${isCompleted ? 'border-green-900/50 shadow-green-950/20' : 'border-slate-800 shadow-xl'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">{job?.routeFrom} → {job?.routeTo}</h4>
                          {isCompleted && (
                            <span className="bg-green-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Done</span>
                          )}
                        </div>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1">Driver: {users.find(u => u.uid === (assignment?.driverId || app.requestedDriverId))?.name}</p>
                        {assignment && (
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-1">
                            Status: <span className={assignment.status === JobStatus.COMPLETED ? 'text-green-400' : 'text-indigo-400'}>{t[assignment.status as keyof typeof t]}</span>
                          </p>
                        )}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${app.status === JobStatus.APPROVED ? 'bg-green-950/40 text-green-400 border-green-900' : 'bg-orange-950/40 text-orange-400 border-orange-900'}`}>
                        {t[app.status as keyof typeof t]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">Suggested Jobs (Pending Admin Approval)</h3>
            <div className="space-y-4">
              {mySuggestedJobs.map(job => (
                <div key={job.jobId} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center opacity-70">
                   <div>
                     <p className="font-bold text-white">{job.routeFrom} → {job.routeTo}</p>
                     <p className="text-[10px] text-slate-500">{job.date} • {job.time}</p>
                     {job.requestedVehicleType && <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{job.requestedVehicleType}</p>}
                   </div>
                   <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{job.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;

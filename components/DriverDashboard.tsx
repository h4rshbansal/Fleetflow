
import React from 'react';
import { User, Assignment, Job, JobStatus, Vehicle } from '../types';

interface DriverDashboardProps {
  t: any;
  currentUser: User;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  jobs: Job[];
  users: User[];
  vehicles: Vehicle[];
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
  t, currentUser, assignments, setAssignments, jobs, users, vehicles 
}) => {
  const myAssignments = assignments.filter(a => a.driverId === currentUser.uid);

  const updateStatus = (assignmentId: string, newStatus: JobStatus) => {
    setAssignments(prev => prev.map(a => a.assignmentId === assignmentId ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">{t.myJobs}</h3>
        <span className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 bg-indigo-950/30 rounded border border-indigo-900">{myAssignments.length} Assignments</span>
      </div>
      
      {myAssignments.length === 0 && (
        <div className="text-center bg-slate-900 p-16 rounded-3xl border border-dashed border-slate-800">
           <p className="text-slate-600 font-bold">No tasks assigned to your shift</p>
        </div>
      )}

      {myAssignments.map(assign => {
        const job = jobs.find(j => j.jobId === assign.jobId);
        const sup = users.find(u => u.uid === assign.supervisorId);
        const vehicle = vehicles.find(v => v.vehicleId === assign.vehicleId);

        return (
          <div key={assign.assignmentId} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 h-1 transition-all duration-500 ${assign.status === JobStatus.COMPLETED ? 'bg-slate-500 w-full' : assign.status === JobStatus.STARTED ? 'bg-green-500 w-2/3' : 'bg-indigo-500 w-1/3'}`}></div>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-black text-2xl text-white tracking-tighter italic">{job?.routeFrom}</h4>
                  <span className="text-indigo-600 font-bold">→</span>
                  <h4 className="font-black text-2xl text-white tracking-tighter italic">{job?.routeTo}</h4>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{job?.date} at {job?.time}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${assign.status === JobStatus.COMPLETED ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-indigo-950/40 text-indigo-400 border-indigo-900'}`}>
                {t[assign.status as keyof typeof t]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 py-4 border-y border-slate-800/40">
              <div className="flex flex-col gap-1">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{t.supervisor}</p>
                <p className="font-bold text-white text-sm">{sup?.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{t.vehicle}</p>
                <p className="font-bold text-white text-sm">{vehicle?.number}</p>
              </div>
            </div>

            {assign.status !== JobStatus.COMPLETED && (
              <div className="flex gap-3 pt-2">
                {assign.status === JobStatus.ACCEPTED && (
                  <button 
                    onClick={() => updateStatus(assign.assignmentId, JobStatus.STARTED)}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    {t.started}
                  </button>
                )}
                {assign.status === JobStatus.STARTED && (
                  <button 
                    onClick={() => updateStatus(assign.assignmentId, JobStatus.COMPLETED)}
                    className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    {t.completed}
                  </button>
                )}
              </div>
            )}
            
            {assign.status === JobStatus.COMPLETED && (
               <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex items-center justify-center gap-2">
                 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job finalized and logged</span>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DriverDashboard;

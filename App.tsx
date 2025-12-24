
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Job, Application, Vehicle, Assignment, JobStatus, Language } from './types';
import { translations } from './translations';
import AdminDashboard from './components/AdminDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import DriverDashboard from './components/DriverDashboard';
import Login from './components/Login';

const INITIAL_USERS: User[] = [
  { uid: 'admin-ishwar', name: 'Ishwar Singh', email: 'ishwar', password: 'ishwar@121', role: UserRole.ADMIN },
  { uid: 'sup-1', name: 'Supervisor Anil', email: 'anil@fleet.com', password: 'password', role: UserRole.SUPERVISOR },
  { uid: 'driver-1', name: 'Driver Rajesh', email: 'rajesh@fleet.com', password: 'password', role: UserRole.DRIVER },
];

const INITIAL_VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Bike'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(INITIAL_VEHICLE_TYPES);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = translations[language];

  // 1. Load data from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobs');
    const savedApps = localStorage.getItem('applications');
    const savedVehicles = localStorage.getItem('vehicles');
    const savedUsers = localStorage.getItem('users');
    const savedAssignments = localStorage.getItem('assignments');
    const savedTypes = localStorage.getItem('vehicleTypes');

    if (savedJobs) setJobs(JSON.parse(savedJobs));
    if (savedApps) setApplications(JSON.parse(savedApps));
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    
    // Merge INITIAL_USERS with saved users to ensure admin always exists
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers) as User[];
      const merged = [...INITIAL_USERS];
      parsed.forEach(u => {
        if (!merged.find(m => m.uid === u.uid)) merged.push(u);
      });
      setUsers(merged);
    }
    
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    if (savedTypes) setVehicleTypes(JSON.parse(savedTypes));
    
    setIsLoaded(true);
  }, []);

  // 2. Immediate persistence on every change
  useEffect(() => {
    if (!isLoaded) return;

    setIsSyncing(true);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    localStorage.setItem('applications', JSON.stringify(applications));
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('vehicleTypes', JSON.stringify(vehicleTypes));
    
    const timer = setTimeout(() => setIsSyncing(false), 200);
    return () => clearTimeout(timer);
  }, [jobs, applications, vehicles, users, assignments, vehicleTypes, isLoaded]);

  const handleLogin = useCallback((identifier: string, pass: string) => {
    const cleanId = identifier.trim();
    const cleanPass = pass.trim();
    const user = users.find(u => (u.email === cleanId || u.uid === cleanId) && u.password === cleanPass);
    if (user) {
      setCurrentUser(user);
    } else {
      alert("Invalid credentials.");
    }
  }, [users]);

  const handleLogout = () => setCurrentUser(null);
  const toggleLanguage = () => setLanguage(p => p === 'en' ? 'hi' : 'en');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white">
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">FF</div>
          <h1 className="text-xl font-bold tracking-tight text-white">FleetFlow</h1>
          {isSyncing && <div className="ml-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage} className="px-3 py-1 text-xs font-semibold border border-slate-700 rounded-full hover:bg-slate-800 transition bg-slate-900">
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
          {currentUser && <button onClick={handleLogout} className="text-xs font-semibold text-slate-400 hover:text-red-400 transition">{t.logout}</button>}
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto w-full p-4 pb-12">
        {!currentUser ? (
          <Login onLogin={handleLogin} t={t} />
        ) : (
          <>
            <header className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{t.dashboard}</h2>
                <p className="text-indigo-400 font-medium capitalize">{currentUser.name} • {t[currentUser.role as keyof typeof t]}</p>
              </div>
            </header>

            {currentUser.role === UserRole.ADMIN && (
              <AdminDashboard 
                t={t} users={users} setUsers={setUsers} jobs={jobs} setJobs={setJobs} vehicles={vehicles} 
                setVehicles={setVehicles} applications={applications} setApplications={setApplications} 
                assignments={assignments} setAssignments={setAssignments} vehicleTypes={vehicleTypes} setVehicleTypes={setVehicleTypes}
              />
            )}

            {currentUser.role === UserRole.SUPERVISOR && (
              <SupervisorDashboard 
                t={t} currentUser={currentUser} jobs={jobs} setJobs={setJobs} applications={applications} 
                setApplications={setApplications} assignments={assignments} vehicles={vehicles} users={users}
                vehicleTypes={vehicleTypes}
              />
            )}

            {currentUser.role === UserRole.DRIVER && (
              <DriverDashboard 
                t={t} currentUser={currentUser} assignments={assignments} setAssignments={setAssignments} 
                jobs={jobs} users={users} vehicles={vehicles}
              />
            )}
          </>
        )}
      </main>
      <footer className="bg-slate-900/50 border-t border-slate-800/50 py-6 text-center">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.3em]">{t.madeBy}</p>
      </footer>
    </div>
  );
};

export default App;

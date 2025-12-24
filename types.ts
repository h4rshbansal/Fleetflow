
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  DRIVER = 'driver'
}

export enum JobStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  ACCEPTED = 'accepted',
  STARTED = 'started',
  COMPLETED = 'completed'
}

export interface User {
  uid: string;
  name: string;
  email: string; // Used as username/email
  role: UserRole;
  password?: string;
}

export interface Job {
  jobId: string;
  date: string;
  time: string;
  routeFrom: string;
  routeTo: string;
  slotCount: number;
  availableSlots: number;
  status?: JobStatus; // PENDING for suggested by supervisor, APPROVED for active
  creatorId?: string;
  requestedVehicleType?: string; // Type suggested by supervisor
}

export interface Application {
  applicationId: string;
  jobId: string;
  supervisorId: string;
  status: JobStatus;
  requestedDriverId?: string; // Driver selected by supervisor
}

export interface Vehicle {
  vehicleId: string;
  number: string;
  type: string;
}

export interface Assignment {
  assignmentId: string;
  jobId: string;
  supervisorId: string;
  driverId: string;
  vehicleId: string;
  status: JobStatus;
}

export type Language = 'en' | 'hi';

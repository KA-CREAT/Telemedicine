export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  pic: string;
  role: string;
}

export interface Participant {
  userId: User;
  role: string;
  joinedAt?: Date;
}

export interface Consultation {
  _id: string;
  appointmentId: string;
  roomId: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'ongoing' | 'completed';
  participants: Participant[];
}
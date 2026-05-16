import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createConsultation = async (appointmentId: string) => {
  const response = await axios.post(`${API_URL}/consultations`, { appointmentId });
  return response.data;
};

export const getConsultation = async (id: string) => {
  const response = await axios.get(`${API_URL}/consultations/${id}`);
  return response.data;
};

export const joinConsultation = async (roomId: string, userId: string) => {
  const response = await axios.post(`${API_URL}/consultations/join`, { roomId, userId });
  return response.data;
};

export const endConsultation = async (roomId: string) => {
  const response = await axios.post(`${API_URL}/consultations/end`, { roomId });
  return response.data;
};

export const getSharedFiles = async (consultationId: string) => {
  const response = await axios.get(`${API_URL}/consultations/${consultationId}/files`);
  return response.data;
};

export const uploadFile = async (file: File, consultationId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('consultationId', consultationId);

  const response = await axios.post(`${API_URL}/files/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteFile = async (fileId: string) => {
  const response = await axios.delete(`${API_URL}/files/${fileId}`);
  return response.data;
};
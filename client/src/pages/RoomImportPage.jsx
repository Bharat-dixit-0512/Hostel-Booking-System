import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import axiosInstance from '../lib/axios';

const RoomImportPage = () => {
  const [hostelId, setHostelId] = useState('');
  const [csv, setCsv] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', csv);
      const res = await axiosInstance.post(`/admin/hostels/${hostelId}/rooms/import/preview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data);
    } catch (err) {
      setError('Preview failed');
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post(`/admin/hostels/${hostelId}/rooms/import/confirm`);
      setPreview(null);
      alert('Import confirmed!');
    } catch (err) {
      setError('Confirm failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <AdminNavbar />
      <h2>Room Import</h2>
      <input placeholder="Hostel ID" value={hostelId} onChange={e => setHostelId(e.target.value)} />
      <input type="file" accept=".csv" onChange={e => setCsv(e.target.files[0])} />
      <button onClick={handlePreview} disabled={loading || !csv || !hostelId}>Preview Import</button>
      {preview && (
        <div>
          <pre>{JSON.stringify(preview, null, 2)}</pre>
          <button onClick={handleConfirm} disabled={loading}>Confirm Import</button>
        </div>
      )}
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
};

export default RoomImportPage;

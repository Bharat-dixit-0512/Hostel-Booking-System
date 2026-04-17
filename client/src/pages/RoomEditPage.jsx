import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import axiosInstance from '../lib/axios';

const RoomEditPage = () => {
  const [hostelId, setHostelId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.put(`/admin/hostels/${hostelId}/rooms/${roomNumber}`, { capacity: Number(capacity) });
      alert('Room updated!');
    } catch (err) {
      setError('Update failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <AdminNavbar />
      <h2>Edit Room</h2>
      <input placeholder="Hostel ID" value={hostelId} onChange={e => setHostelId(e.target.value)} />
      <input placeholder="Room Number" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} />
      <input placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} />
      <button className="cursor-pointer" onClick={handleUpdate} disabled={loading || !hostelId || !roomNumber || !capacity}>Update Room</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
};

export default RoomEditPage;

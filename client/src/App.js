import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Backend URL
const SOCKET_URL = "http://127.0.0.1:5000";

function App() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientName: '', age: '', location: '', type: 'Mother', healthStatus: 'Healthy'
  });

  // 1. Initial Data Fetch & Socket Setup
  useEffect(() => {
    const socket = io(SOCKET_URL);

    // Pehle se maujood data lana
    axios.get(`${SOCKET_URL}/api/patients`)
      .then(res => setPatients(res.data))
      .catch(err => console.error("Fetch Error:", err));

    // Real-time Update sunna
    socket.on('new-patient-added', (newPatient) => {
      setPatients((prev) => [newPatient, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  // 2. Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${SOCKET_URL}/api/patients`, formData);
      setFormData({ patientName: '', age: '', location: '', type: 'Mother', healthStatus: 'Healthy' });
      alert("Data Saved Successfully!");
    } catch (err) {
      alert("Error saving data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-blue-800">RCH Real-Time Portal</h1>
          <p className="text-gray-500">Reproductive and Child Health Monitoring Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Registration Form */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">New Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="Mother">Mother</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Save Patient</button>
            </form>
          </div>

          {/* Real-time Patient List */}
          <div className="lg:col-cols-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
              Live Updates <span className="ml-2 flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.patientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${p.healthStatus === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.healthStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
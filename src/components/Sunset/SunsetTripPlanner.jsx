import { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'

export default function SunsetTripPlanner({ spot, locationInfo, onCancel, onSave }) {
  const { saveActivity } = useApp();
  const [arrivalBuffer, setArrivalBuffer] = useState('60');
  const [groupSize, setGroupSize] = useState('alone');

  // Dummy sunset time for demonstration
  const sunsetTime = '18:45';

  const handleSave = () => {
    saveActivity({
      moduleId: 'suncast',
      moduleName: 'SunCast',
      headline: `Sunset Trip to ${spot.name}`,
      score: 95, 
      formData: { spot, locationInfo, arrivalBuffer, groupSize },
      result: { recommendation: `Arrive by ${arrivalBuffer === '60' ? '17:45' : arrivalBuffer === '30' ? '18:15' : '17:15'}` }
    });
    onSave({
      spot,
      locationInfo,
      arrivalBuffer,
      groupSize,
      sunsetTime
    });
  };

  return (
    <div className="sunset-planner glass-card p-6" style={{ padding: 'var(--space-6)' }}>
      <h2 className="details-section-title">Plan My Sunset Trip</h2>
      <p className="details-desc mb-4">Set up your visit to <strong>{spot.name}</strong>.</p>

      <div className="form-group">
        <label className="form-label">When to arrive?</label>
        <select 
          className="form-select" 
          value={arrivalBuffer} 
          onChange={e => setArrivalBuffer(e.target.value)}
        >
          <option value="30">30 minutes before sunset</option>
          <option value="60">1 hour before sunset (Golden Hour)</option>
          <option value="90">1.5 hours before sunset</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Who is going?</label>
        <select 
          className="form-select" 
          value={groupSize} 
          onChange={e => setGroupSize(e.target.value)}
        >
          <option value="alone">Just me</option>
          <option value="friend">With a friend</option>
          <option value="group">With a group</option>
        </select>
      </div>

      <div className="mt-4 p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Trip Summary</h4>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li><strong>Destination:</strong> {spot.name}</li>
          <li><strong>Estimated Sunset:</strong> {sunsetTime}</li>
          <li><strong>Suggested Arrival:</strong> {arrivalBuffer === '60' ? '17:45' : arrivalBuffer === '30' ? '18:15' : '17:15'}</li>
        </ul>
        <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          * Times are approximate based on general local solar data.
        </div>
      </div>

      <div className="details-actions" style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-hero" onClick={handleSave}>Save Trip</button>
      </div>
    </div>
  )
}

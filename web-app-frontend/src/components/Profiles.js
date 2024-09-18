// frontend/src/components/Profiles.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Components.css'; // Import component-specific styles

const Profiles = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [psychologistProfiles, setPsychologistProfiles] = useState([]);
  const [editingUserProfile, setEditingUserProfile] = useState(null);
  const [editingPsychologistProfile, setEditingPsychologistProfile] = useState(null);

  useEffect(() => {
    api.get('/profiles') // Fetch all profiles
      .then(response => {
        setUserProfiles(response.data.userProfiles);
        setPsychologistProfiles(response.data.psychologistProfiles);
      })
      .catch(error => console.error(error));
  }, []);

  const handleProfileUpdate = (profileId, updates, type) => {
    const url = type === 'user' ? '/profiles/updateUser' : '/profiles/updatePsychologist';
    api.post(url, { profileId, updates })
      .then(response => console.log('Profile updated:', response.data))
      .catch(error => console.error('Update failed:', error));
  };

  return (
    <div className="profiles-container">
      <h1 className="section-title">User and Psychologist Profiles</h1>
      <h2 className="subsection-title">User Profiles</h2>
      <ul className="profile-list">
        {userProfiles.map(profile => (
          <li key={profile._id} className="profile-item">
            {profile.username} - {profile.email}
            <button
              onClick={() => setEditingUserProfile(profile)}
              className="edit-button"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
      <h2 className="subsection-title">Psychologist Profiles</h2>
      <ul className="profile-list">
        {psychologistProfiles.map(profile => (
          <li key={profile._id} className="profile-item">
            {profile.name} - {profile.specialization}
            <button
              onClick={() => setEditingPsychologistProfile(profile)}
              className="edit-button"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      {/* Conditional Rendering for Editing Forms */}
      {editingUserProfile && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProfileUpdate(editingUserProfile._id, { /* Your updates */ }, 'user');
            setEditingUserProfile(null); // Reset editing state
          }}
          className="edit-form"
        >
          <h3>Edit User Profile</h3>
          <input
            type="text"
            value={editingUserProfile.username}
            onChange={(e) =>
              setEditingUserProfile({ ...editingUserProfile, username: e.target.value })
            }
            className="form-input"
          />
          <button type="submit" className="form-button">Save</button>
        </form>
      )}

      {editingPsychologistProfile && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProfileUpdate(editingPsychologistProfile._id, { /* Your updates */ }, 'psychologist');
            setEditingPsychologistProfile(null); // Reset editing state
          }}
          className="edit-form"
        >
          <h3>Edit Psychologist Profile</h3>
          <input
            type="text"
            value={editingPsychologistProfile.name}
            onChange={(e) =>
              setEditingPsychologistProfile({ ...editingPsychologistProfile, name: e.target.value })
            }
            className="form-input"
          />
          <button type="submit" className="form-button">Save</button>
        </form>
      )}
    </div>
  );
};

export default Profiles;

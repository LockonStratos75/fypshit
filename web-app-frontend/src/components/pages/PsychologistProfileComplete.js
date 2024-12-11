// frontend/src/components/Pages/PsychologistProfileComplete.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PsychologistProfileComplete = () => {
  const [formData, setFormData] = useState({
    specialization: '',
    yearsOfExperience: '',
    phoneNumber: '',
  });
  const [licenseImage, setLicenseImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'licenseImage') {
      setLicenseImage(e.target.files[0]);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const data = new FormData();
    data.append('specialization', formData.specialization);
    data.append('yearsOfExperience', formData.yearsOfExperience);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('licenseImage', licenseImage);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/psychologist/profile/complete', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Redirect to application pending page
      navigate('/psychologist/application-pending');
    } catch (error) {
      console.error('Error completing profile:', error);
      // Handle errors as needed
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <label>Specialization:</label>
        <input
          type="text"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Years of Experience:</label>
        <input
          type="number"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          min="0"
          max="100"
        />
      </div>
      <div>
        <label>Phone Number:</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>License Image:</label>
        <input
          type="file"
          name="licenseImage"
          accept="image/*"
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Complete Profile</button>
    </form>
  );
};

export default PsychologistProfileComplete;

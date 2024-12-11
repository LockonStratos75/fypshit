// src/components/Pages/PsychologistLicense.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PsychologistLicense = () => {
  const [licenseImageUrl, setLicenseImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLicenseImage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/psychologist/profile/license', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob', // Important for handling binary data
        });

        // Create a URL for the image blob
        const imageUrl = URL.createObjectURL(new Blob([response.data]));
        setLicenseImageUrl(imageUrl);
      } catch (err) {
        console.error('Error fetching license image:', err);
        setError('Failed to load license image.');
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseImage();
  }, []);

  if (loading) return <p>Loading license image...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Your License Image</h3>
      {licenseImageUrl ? (
        <img src={licenseImageUrl} alt="License" style={{ maxWidth: '300px' }} />
      ) : (
        <p>No license image uploaded.</p>
      )}
    </div>
  );
};

export default PsychologistLicense;

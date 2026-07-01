import React, { useState } from 'react';
import SuperadminLogin from '../../components/superadmin/superadminlogin';

const SuperadminLoginPage = () => {
  const [token, setToken] = useState('');

  const handleLogin = (token) => {
    setToken(token);
    // Save token in localStorage or global state as needed
  };

  return (
    <div>
      {token ? (
        <h3>Welcome Superadmin! Token: {token}</h3>
      ) : (
        <SuperadminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};

export default SuperadminLoginPage;

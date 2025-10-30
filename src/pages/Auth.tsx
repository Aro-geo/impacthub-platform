
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FloatingAuthModal from '@/components/FloatingAuthModal';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <FloatingAuthModal
      isOpen={showModal}
      onClose={handleClose}
      initialMode="signup"
    />
  );
};

export default Auth;

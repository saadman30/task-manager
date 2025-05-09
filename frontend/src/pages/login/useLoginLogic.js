import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { handleError, AppError, ErrorSeverity } from '../../utils/errorHandler';

const defaultFormData = {
  email: '',
  password: '',
};

export function useLoginLogic() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(defaultFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        throw new AppError(result.error || 'Login failed. Please try again.', ErrorSeverity.ERROR);
      }
    } catch (error) {
      handleError(error, 'login');
      setError(
        error.response?.data?.message ||
        error.message ||
        'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    handleChange,
    handleSubmit,
  };
} 
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormGroup from '../../shared/ui/FormGroup';
import Button from '../../shared/ui/Button';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSignIn, setIsSignIn] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { signin, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isSignIn && password !== confirmPassword) {
      // Error will be handled by the FormGroup component
      return;
    }
    
    try {
      setLoading(true);
      if (isSignIn) {
        await signin(username, password);
        // After successful sign in, redirect to home page
        navigate('/');
      } else {
        await signup(name, username, email, password);
        // After successful sign up, redirect to home page
        navigate('/');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || (isSignIn ? t('failedToSignIn') : t('failedToSignUp')));
    }
    
    setLoading(false);
  };

  return (
    <div className=" bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/paypoint-192.png"
            alt={t('auth.logoAlt')}
            className="w-32 h-32 rounded-xl"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignIn ? t('auth.signInTitle') : t('auth.signUpTitle')}
        </h2>
       
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isSignIn && (
              <FormGroup
                label={t('auth.fullNameLabel')}
                id="name"
                name="name"
                type="text"
                required={!isSignIn}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            
            <FormGroup
              label={t('auth.usernameLabel')}
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />

            {!isSignIn && (
              <FormGroup
                label={t('auth.emailLabel')}
                id="email"
                name="email"
                type="email"
                required={!isSignIn}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            <FormGroup
              label={t('auth.passwordLabel')}
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {!isSignIn && (
              <FormGroup
                label={t('auth.confirmPasswordLabel')}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required={!isSignIn}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={password !== confirmPassword && confirmPassword ? t('auth.passwordsDoNotMatchError') : undefined}
              />
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.processingButton')}
                  </div>
                ) : (isSignIn ? t('auth.signInButton') : t('auth.signUpButton'))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
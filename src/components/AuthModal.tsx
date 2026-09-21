import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Lock, LogIn, Mail, UserPlus, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { userId: string; email: string }) => void;
  initialTab?: 'login' | 'signup';
}

type AuthTab = 'login' | 'signup';

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'signup',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setSuccessMessage('');
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const normalizedEmail = email.trim();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Please enter your password.';
    } else if (activeTab === 'signup' && password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const guestToken = localStorage.getItem('hamnafas_guest_token');
      const endpoint = activeTab === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const expectedStatus = activeTab === 'signup' ? 201 : 200;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(guestToken ? { 'X-Guest-Token': guestToken } : {}),
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.status === expectedStatus) {
        const user = await res.json();
        setSuccessMessage(activeTab === 'signup' ? 'Account created successfully.' : 'Welcome back. You are signed in.');
        successTimerRef.current = window.setTimeout(() => {
          onAuthSuccess({ userId: user.userId, email: user.email });
        }, 650);
        return;
      }

      if (activeTab === 'signup' && res.status === 409) {
        setErrors({ form: 'An account with this email already exists.' });
      } else if (activeTab === 'login' && res.status === 401) {
        setErrors({ form: 'Invalid email or password. Please try again.' });
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' });
      }
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const HeaderIcon = activeTab === 'signup' ? UserPlus : LogIn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173d60]/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#f8fbfe] rounded-3xl border border-[#d6e7f7] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white/95 border-b border-[#d8e7f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e3effa] text-[#1e3a5f] flex items-center justify-center shadow-xs">
              <HeaderIcon className="w-5 h-5 text-[#244f77]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#173d60]">Your Hamnafas account</h3>
              <p className="text-xs text-[#627d98]">Keep your progress and conversations with you</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5f7488] hover:text-[#173d60] hover:bg-[#e4eff9] transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#edf4fb] border-b border-[#d8e7f5]">
          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`flex-1 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'signup' ? 'bg-[#1e3a5f] text-white shadow-xs' : 'text-[#486581] hover:text-[#173d60]'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-[#1e3a5f] text-white shadow-xs' : 'text-[#486581] hover:text-[#173d60]'
            }`}
          >
            Log In
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-[#173d60] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f7488]" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#cde0f0] rounded-xl text-sm text-[#173d60] focus:border-[#7ba8c9] focus:outline-none shadow-xs"
                placeholder="you@example.com"
                disabled={isSubmitting || Boolean(successMessage)}
              />
            </div>
            {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-[#173d60] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f7488]" />
              <input
                id="auth-password"
                type="password"
                minLength={activeTab === 'signup' ? 8 : undefined}
                autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#cde0f0] rounded-xl text-sm text-[#173d60] focus:border-[#7ba8c9] focus:outline-none shadow-xs"
                placeholder={activeTab === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                disabled={isSubmitting || Boolean(successMessage)}
              />
            </div>
            {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>}
          </div>

          {activeTab === 'signup' && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-[#173d60] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f7488]" />
                <input
                  id="auth-confirm-password"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#cde0f0] rounded-xl text-sm text-[#173d60] focus:border-[#7ba8c9] focus:outline-none shadow-xs"
                  placeholder="Enter your password again"
                  disabled={isSubmitting || Boolean(successMessage)}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-600">{errors.confirmPassword}</p>}
            </div>
          )}

          {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
          {successMessage && <p className="text-xs font-semibold text-emerald-700">{successMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#173d60] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {activeTab === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>
              {isSubmitting
                ? activeTab === 'signup'
                  ? 'Creating account...'
                  : 'Logging in...'
                : activeTab === 'signup'
                ? 'Create Account'
                : 'Log In'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

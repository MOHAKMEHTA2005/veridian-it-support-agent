import React, { useState } from 'react';
import { X, LogIn, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isConfigured, loginWithGoogle, loginWithEmail, registerWithEmail, logOut } from '../services/firebase';

export default function AuthModal({ isOpen, onClose, authUser, onUserChange }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = await loginWithGoogle();
      onUserChange(cred.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let cred;
      if (isRegister) {
        cred = await registerWithEmail(email, password);
      } else {
        cred = await loginWithEmail(email, password);
      }
      onUserChange(cred.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    onUserChange(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogIn size={20} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Firebase Authentication</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.8125rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Shield size={16} style={{ color: '#818cf8' }} />
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>Firebase Project: veridian-it-support-agent</span>
            </div>
            {isConfigured ? (
              <span style={{ color: '#34d399' }}>✓ Firebase client configured with active credentials.</span>
            ) : (
              <span>Note: Running in local prototype mode. Employee identity switcher in the top navigation is active.</span>
            )}
          </div>

          {authUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  <span>Authenticated as:</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9375rem', fontWeight: 600 }}>
                  {authUser.displayName || authUser.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  UID: {authUser.uid}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                style={{ background: '#ef4444', color: 'white', padding: '0.625rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  color: '#1e293b',
                  padding: '0.625rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  width: '100%'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', margin: '0.5rem 0' }}>
                — OR USE CORPORATE EMAIL —
              </div>

              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="email"
                  className="chat-input"
                  placeholder="name@veridiancorp.example"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="chat-input"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#6366f1',
                    color: 'white',
                    padding: '0.625rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {isRegister ? 'Register Account' : 'Sign In with Password'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                style={{ fontSize: '0.75rem', color: '#818cf8', textAlign: 'center' }}
              >
                {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import loginBgImg from '../assets/Login_page.png';
import { Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [activeSlide, setActiveSlide] = useState(2);

  // Form states
  const [firstName, setFirstName] = useState('Fletcher');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && !agreeTerms) {
      setError('You must agree to the Terms & Conditions.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin
        ? 'http://localhost:3000/auth/login'
        : 'http://localhost:3000/auth/register';

      const payload = isLogin
        ? { email, password }
        : { firstName, lastName, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Save token in localStorage
      localStorage.setItem('token', data.token);

      // Redirect to home dashboard
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Left Hero Image Banner */}
        <div
          className="left-hero-section"
          style={{ backgroundImage: `url(${loginBgImg})` }}
        >
          {/* Top Brand & Action */}
          <div className="hero-top-bar">
            <span className="brand-logo">AMU</span>
            <button className="back-website-btn">
              <span>Back to website</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Bottom Heading & Carousel Indicators */}
          <div className="hero-bottom-content">
            <h2 className="hero-heading">
              Capturing Moments,<br />
              Creating Memories
            </h2>

            <div className="carousel-indicators">
              <div
                className={`indicator-bar short ${activeSlide === 0 ? 'active' : ''}`}
                onClick={() => setActiveSlide(0)}
              />
              <div
                className={`indicator-bar medium ${activeSlide === 1 ? 'active' : ''}`}
                onClick={() => setActiveSlide(1)}
              />
              <div
                className={`indicator-bar ${activeSlide === 2 ? 'active' : ''}`}
                onClick={() => setActiveSlide(2)}
              />
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="right-form-section">
          <div className="right-form-content-inner">
            <div className="form-header">
              <h1 className="form-title">
                {isLogin ? "Log in to account" : "Create an account"}
              </h1>
              <p className="form-subtitle">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <span className="login-link" onClick={() => setIsLogin(false)}>
                      Sign up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="login-link" onClick={() => setIsLogin(true)}>
                      Log in
                    </span>
                  </>
                )}
              </p>
            </div>

            {error && (
              <div className="auth-error-banner animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-row-dual">
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      className={`auth-input ${firstName ? 'active-filled' : ''}`}
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      className={`auth-input ${lastName ? 'active-filled' : ''}`}
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="input-field-wrapper">
                <input
                  type="email"
                  className={`auth-input ${email ? 'active-filled' : ''}`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-field-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`auth-input ${password ? 'active-filled' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="password-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {!isLogin && (
                <div className="terms-checkbox-row">
                  <div
                    className={`custom-checkbox ${agreeTerms ? 'checked' : ''}`}
                    onClick={() => setAgreeTerms(!agreeTerms)}
                  >
                    {agreeTerms && <Check size={13} strokeWidth={3} />}
                  </div>
                  <span className="terms-text">
                    I agree to the <span className="terms-link">Terms & Conditions</span>
                  </span>
                </div>
              )}

              <button type="submit" className="submit-account-btn" disabled={loading}>
                {loading ? <div className="btn-spinner"></div> : (isLogin ? "Log in" : "Create account")}
              </button>

              <div className="or-divider">
                <div className="divider-line" />
                <span className="divider-text">
                  {isLogin ? "Or log in with" : "Or register with"}
                </span>
                <div className="divider-line" />
              </div>

              <div className="social-buttons-row">
                <button type="button" className="social-btn" onClick={handleGoogleLogin}>
                  <svg className="social-icon-svg" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

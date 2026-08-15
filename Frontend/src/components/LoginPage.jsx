import React, { useState } from 'react';
import './LoginPage.css';
import loginBgImg from '../assets/Login_page.png';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [activeSlide, setActiveSlide] = useState(2);

  // Form states
  const [firstName, setFirstName] = useState('Fletcher');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in..." : "Creating account...", { firstName, lastName, email, password });
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

              <button type="submit" className="submit-account-btn">
                {isLogin ? "Log in" : "Create account"}
              </button>

              <div className="or-divider">
                <div className="divider-line" />
                <span className="divider-text">
                  {isLogin ? "Or log in with" : "Or register with"}
                </span>
                <div className="divider-line" />
              </div>

              <div className="social-buttons-row">
                <button type="button" className="social-btn">
                  <svg className="social-icon-svg" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button type="button" className="social-btn">
                  <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.16-.57 2.81-1.37z"/>
                  </svg>
                  <span>Apple</span>
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

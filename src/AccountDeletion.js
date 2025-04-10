import React, { useState, useEffect, useRef } from 'react';

const AccountDeletion = () => {
    const BASE_URL = "https://api.stoxii.com/";
    const RESEND_TIMEOUT = 30;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '',]);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMEOUT);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState({
    sendOtp: false,
    verifyOtp: false,
    deleteAccount: false
  });

  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft > 0 && secondsLeft < RESEND_TIMEOUT) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (secondsLeft === 0) {
      setIsResendDisabled(false);
    }
  }, [secondsLeft]);

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOtpChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    if (e.target.value && index < otp.length - 1) {
        otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const startResendTimer = () => {
    setSecondsLeft(RESEND_TIMEOUT);
    setIsResendDisabled(true);
  };

  const sendOtp = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setIsLoading({ ...isLoading, sendOtp: true });

    try {
      // API call to send OTP
      const response = await fetch(`${BASE_URL}api/v1/auth/phone-otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      const data = await response.json();
      console.log('OTP sent to:', phoneNumber, data);
      
      setShowOtpSection(true);
      startResendTimer();
      alert('Verification code sent to your phone');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('An error occurred while sending the verification code');
    } finally {
      setIsLoading({ ...isLoading, sendOtp: false });
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      alert('Please enter the 4-digit verification code');
      return;
    }

    setIsLoading({ ...isLoading, verifyOtp: true });

    try {
      // API call to verify OTP
      const response = await fetch(`${BASE_URL}api/v1/auth/phone-otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber, 
          otp: otpString 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify code');
      }

      const data = await response.json();
      console.log('OTP verified:', data);
      
      setIsDeleteEnabled(true);
      setShowOtpSection(false);
      alert('Verification successful. You can now proceed with account deletion.');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('An error occurred while verifying the code');
    } finally {
      setIsLoading({ ...isLoading, verifyOtp: false });
    }
  };

  const resendOtp = async () => {
    if (!phoneNumber) {
      alert('Phone number is required');
      return;
    }

    setIsResendDisabled(true);
    startResendTimer();

    try {
      // API call to resend OTP
      const response = await fetch(`${BASE_URL}api/v1/auth/phone-otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification code');
      }

      const data = await response.json();
      console.log('Resending OTP to:', phoneNumber, data);
      alert('New verification code sent to your phone');
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('An error occurred while resending the code');
      setIsResendDisabled(false);
    }
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      setIsLoading({ ...isLoading, deleteAccount: true });
      
      // Simulate account deletion
      setTimeout(() => {
        console.log('Account deletion requested for:', phoneNumber);
        setShowConfirmation(true);
        setIsLoading({ ...isLoading, deleteAccount: false });
      }, 1500);
    }
  };

  return (
    <div className="account-deletion-container">
      <div className="account-deletion-card">
        <div className="logo">
          <img src="/stoxii.png" alt="Stoxii Logo" />
        </div>

        {!showConfirmation ? (
          <div className="deletion-form">
            <h1>Delete Your Stoxii Account</h1>
            <p className="description">
              To delete your account and all associated data, please verify your identity.
            </p>

            <div className="form-container">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Enter your registered phone number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  readOnly={showOtpSection}
                />
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={sendOtp}
                disabled={isLoading.sendOtp}
              >
                {isLoading.sendOtp ? 'Sending...' : 'Send Verification Code'}
              </button>

              {showOtpSection && (
                <div className="otp-section">
                  <div className="form-group">
                    <label>Verification Code</label>
                    <div className="otp-inputs">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          className="otp-input"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="resend-otp">
                    Didn't receive code?{' '}
                    <button
                      className="resend-button"
                      onClick={resendOtp}
                      disabled={isResendDisabled}
                    >
                      Resend
                    </button>
                    {isResendDisabled && (
                      <span className="timer">({secondsLeft}s)</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={verifyOtp}
                    disabled={isLoading.verifyOtp}
                  >
                    {isLoading.verifyOtp ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              )}

              <button
                type="button"
                className="button button-danger"
                onClick={deleteAccount}
                disabled={!isDeleteEnabled || isLoading.deleteAccount}
              >
                {isLoading.deleteAccount ? 'Deleting...' : 'Proceed with Account Deletion'}
              </button>

              <p className="disclaimer">
                By proceeding, you acknowledge that all your data will be permanently deleted after 7 days.
                This action cannot be undone. For more information, please review our{' '}
                <a href="https://stoxii.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </p>
            </div>
          </div>
        ) : (
          <div className="confirmation">
            <div className="confirmation-icon">⚠️</div>
            <h2>Account Deletion Request Received</h2>
            <p>Your Stoxii account will be permanently deleted in 7 days.</p>
            <p>
              If this was a mistake or you change your mind, please contact support - accounts@stoxii.com
              within this period to cancel the deletion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDeletion;

const styles = `
.account-deletion-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1f2937;
  background-color: #f3f4f6;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem;
}

.account-deletion-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.logo {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo img {
  height: 48px;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-container {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin-top: 0.5rem;
}

.button-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.button-primary:hover {
  background-color: #1d4ed8;
}

.button-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.button-danger {
  background-color: #dc2626;
  color: #ffffff;
  margin-top: 1rem;
}

.button-danger:hover {
  background-color: #b91c1c;
}

.button-danger:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.disclaimer {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 1.5rem;
  text-align: center;
}

.confirmation {
  text-align: center;
  padding: 1.5rem 0;
}

.confirmation-icon {
  font-size: 3rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.confirmation h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.confirmation p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.otp-section {
  margin-top: 1rem;
}

.otp-inputs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.otp-input {
  width: 15%;
  text-align: center;
  font-size: 1.2rem;
  padding: 0.5rem;
}

.resend-otp {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.resend-button {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.resend-button:disabled {
  color: #6b7280;
  text-decoration: none;
  cursor: not-allowed;
}

.timer {
  color: #6b7280;
}

@media (max-width: 480px) {
  .account-deletion-card {
    padding: 1.5rem;
  }
  
  .otp-inputs {
    gap: 0.25rem;
  }
}
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
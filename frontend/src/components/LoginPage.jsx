import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { translations } from '../i18n/translations';
import './AuthPages.css';

const LoginPage = ({ onLoginSuccess, onForgotPassword, language = 'EN' }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language] || translations.EN;
    const isRTL = language === 'AR';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !secretAnswer.trim()) {
            setError(t.error);
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.login(username, secretAnswer);
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.message || t.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`auth-page ${isRTL ? 'rtl' : ''}`}>
            <section className="auth-card card">
                <div className="auth-hero">
                    <div className="auth-copy">
                        <span className="eyebrow">{t.auth.login}</span>
                        <h1 className="auth-title">{t.auth.loginTitle}</h1>
                        <p className="auth-subtitle">{t.auth.loginSubtitle}</p>
                    </div>
                </div>

                <div className="helper-row">
                    <span className="badge">{t.helper}</span>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="login-username">{t.common.username}</label>
                            <span className="hint">required</span>
                        </div>
                        <input
                            id="login-username"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t.common.username}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="login-secret-answer">{t.auth.secretAnswer}</label>
                            <span className="hint">required</span>
                        </div>
                        <input
                            id="login-secret-answer"
                            className="input-field"
                            type="password"
                            value={secretAnswer}
                            onChange={(e) => setSecretAnswer(e.target.value)}
                            placeholder={t.auth.secretAnswer}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    {error && <div className="error-banner" role="alert">{error}</div>}

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? t.common.loading : t.auth.login}
                    </button>
                </form>

                <div
                    className="secondary-link"
                    onClick={() => onForgotPassword && onForgotPassword()}
                    style={{ cursor: 'pointer', marginBottom: '1rem' }}
                >
                    {t.auth.forgotPassword}
                </div>

                {/* Navigation buttons */}
                <div className="auth-nav-buttons">
                    <button 
                        onClick={() => navigate('/signup')}
                        className="nav-btn signup-btn"
                    >
                        {t.auth.noAccount} <strong>{t.buttons.signup}</strong>
                    </button>
                    <button 
                        onClick={() => navigate('/home')}
                        className="nav-btn home-btn"
                    >
                        {t.buttons.backToHome}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;

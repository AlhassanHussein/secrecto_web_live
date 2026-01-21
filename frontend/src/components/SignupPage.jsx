import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { translations } from '../i18n/translations';
import './AuthPages.css';

const SignupPage = ({ onSignupSuccess, language = 'EN' }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [secretPhrase, setSecretPhrase] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language] || translations.EN;
    const isRTL = language === 'AR';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim() || !secretPhrase.trim() || !secretAnswer.trim()) {
            setError(t.errors.generic);
            return;
        }
        if (!acceptTerms) {
            setError(t.auth.rememberMe);
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.signup(username, name || null, secretPhrase, secretAnswer);
            setSuccess(t.auth.signupSuccess);
            setTimeout(() => {
                if (onSignupSuccess) {
                    onSignupSuccess();
                }
            }, 1000);
        } catch (err) {
            setError(err.message || t.auth.userExists);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`auth-page ${isRTL ? 'rtl' : ''}`}>
            <section className="auth-card card">
                <div className="auth-hero">
                    <div className="auth-copy">
                        <span className="eyebrow">{t.auth.signup}</span>
                        <h1 className="auth-title">{t.auth.signupTitle}</h1>
                        <p className="auth-subtitle">{t.auth.signupSubtitle}</p>
                    </div>
                </div>

                <div className="helper-row">
                    <span className="badge">{t.auth.notAuthenticated}</span>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="signup-username">{t.common.username}</label>
                            <span className="hint">required</span>
                        </div>
                        <input
                            id="signup-username"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t.common.username}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="signup-name">{t.common.name}</label>
                        </div>
                        <input
                            id="signup-name"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.common.name}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="signup-phrase">{t.auth.secretPhrase}</label>
                            <span className="hint">required</span>
                        </div>
                        <input
                            id="signup-phrase"
                            className="input-field"
                            type="text"
                            value={secretPhrase}
                            onChange={(e) => setSecretPhrase(e.target.value)}
                            placeholder={t.auth.secretPhrase}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="signup-answer">{t.auth.secretAnswer}</label>
                            <span className="hint">required</span>
                        </div>
                        <input
                            id="signup-answer"
                            className="input-field"
                            type="password"
                            value={secretAnswer}
                            onChange={(e) => setSecretAnswer(e.target.value)}
                            placeholder={t.auth.secretAnswer}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group checkbox">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                        />
                        <label htmlFor="terms">{t.auth.rememberMe}</label>
                    </div>

                    {error && <div className="error-banner" role="alert">{error}</div>}
                    {success && <div className="success-banner" role="status">{success}</div>}

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? t.common.loading : t.auth.signup}
                    </button>
                </form>

                {/* Navigation buttons */}
                <div className="auth-nav-buttons">
                    <button 
                        onClick={() => navigate('/login')}
                        className="nav-btn login-btn"
                    >
                        {t.auth.haveAccount} <strong>{t.buttons.login}</strong>
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

export default SignupPage;

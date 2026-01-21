import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { translations } from '../i18n/translations';
import './AuthPages.css';

const SettingsPage = ({ currentUser, onLogout, onLanguageChange, language = 'EN' }) => {
    const [secretPhrase, setSecretPhrase] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language] || translations.EN;
    const isRTL = language === 'AR';

    const handleLanguageChange = async (newLang) => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await authAPI.updateSettings({ language: newLang });
            setSuccess(translations[newLang].common.loading);
            if (onLanguageChange) {
                onLanguageChange(newLang);
            }
        } catch (err) {
            setError(err.message || translations[newLang].errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSecretUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!secretPhrase.trim() && !secretAnswer.trim()) {
            // No changes, just return
            return;
        }

        if ((secretPhrase.trim() && !secretAnswer.trim()) || (!secretPhrase.trim() && secretAnswer.trim())) {
            setError(t.errors.generic);
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.updateSettings({
                secret_phrase: secretPhrase,
                secret_answer: secretAnswer,
            });
            setSuccess(t.common.save);
            setSecretPhrase('');
            setSecretAnswer('');
        } catch (err) {
            setError(err.message || t.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <div className={`auth-page ${isRTL ? 'rtl' : ''}`}>
            <section className="auth-card card">
                <div className="auth-hero">
                    <div className="auth-copy">
                        <span className="eyebrow">{t.nav.settings}</span>
                        <h1 className="auth-title">{t.settings.title}</h1>
                        <p className="auth-subtitle">{t.settings.subtitle}</p>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="form-group">
                    <label className="label">{t.settings.language}</label>
                    <div className="language-toggle" style={{ marginTop: '8px' }}>
                        {['EN', 'AR', 'ES'].map((lang) => (
                            <button
                                key={lang}
                                className={`lang-pill ${language === lang ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(lang)}
                                disabled={isLoading}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Secret Phrase & Answer Update */}
                <form className="auth-form" onSubmit={handleSecretUpdate} style={{ marginTop: '24px' }}>
                    <div className="form-group">
                        <label className="label" htmlFor="secret-phrase">
                            {t.auth.secretPhrase}
                        </label>
                        <input
                            id="secret-phrase"
                            className="input-field"
                            type="text"
                            value={secretPhrase}
                            onChange={(e) => setSecretPhrase(e.target.value)}
                            placeholder={t.auth.secretPhrase}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="secret-answer">
                            {t.auth.secretAnswer}
                        </label>
                        <input
                            id="secret-answer"
                            className="input-field"
                            type="password"
                            value={secretAnswer}
                            onChange={(e) => setSecretAnswer(e.target.value)}
                            placeholder={t.auth.secretAnswer}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    {error && <div className="error-banner" role="alert">{error}</div>}
                    {success && <div className="success-banner" role="status">{success}</div>}

                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={isLoading || (!secretPhrase.trim() && !secretAnswer.trim())}
                    >
                        {isLoading ? t.common.loading : t.common.save}
                    </button>
                </form>

                {/* Logout Button */}
                <button
                    className="primary-btn"
                    onClick={handleLogout}
                    style={{ marginTop: '16px', backgroundColor: '#ff4444' }}
                >
                    {t.buttons.logout}
                </button>
            </section>
        </div>
    );
};

export default SettingsPage;

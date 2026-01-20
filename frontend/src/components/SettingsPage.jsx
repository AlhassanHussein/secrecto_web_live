import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import './AuthPages.css';

const translations = {
    EN: {
        eyebrow: 'Settings',
        title: 'Account Settings',
        subtitle: 'Manage your preferences and security.',
        languageLabel: 'App Language',
        secretLabel: 'Change Secret Phrase & Answer',
        secretPhraseLabel: 'New Secret Phrase',
        secretAnswerLabel: 'New Secret Answer',
        updateBtn: 'Update Settings',
        logoutBtn: 'Logout',
        success: 'Settings updated successfully!',
        error: 'Failed to update settings',
        bothRequired: 'Both secret phrase and answer are required',
    },
    AR: {
        eyebrow: 'الإعدادات',
        title: 'إعدادات الحساب',
        subtitle: 'إدارة تفضيلاتك وأمانك.',
        languageLabel: 'لغة التطبيق',
        secretLabel: 'تغيير العبارة السرية والإجابة',
        secretPhraseLabel: 'عبارة سرية جديدة',
        secretAnswerLabel: 'إجابة سرية جديدة',
        updateBtn: 'تحديث الإعدادات',
        logoutBtn: 'تسجيل الخروج',
        success: 'تم تحديث الإعدادات بنجاح!',
        error: 'فشل تحديث الإعدادات',
        bothRequired: 'كل من العبارة السرية والإجابة مطلوبان',
    },
    ES: {
        eyebrow: 'Configuración',
        title: 'Configuración de cuenta',
        subtitle: 'Gestiona tus preferencias y seguridad.',
        languageLabel: 'Idioma de la aplicación',
        secretLabel: 'Cambiar frase secreta y respuesta',
        secretPhraseLabel: 'Nueva frase secreta',
        secretAnswerLabel: 'Nueva respuesta secreta',
        updateBtn: 'Actualizar configuración',
        logoutBtn: 'Cerrar sesión',
        success: '¡Configuración actualizada!',
        error: 'Error al actualizar configuración',
        bothRequired: 'Se requieren tanto la frase como la respuesta',
    },
};

const SettingsPage = ({ currentUser, onLogout, onLanguageChange }) => {
    const [language, setLanguage] = useState(currentUser?.language || 'EN');
    const [secretPhrase, setSecretPhrase] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language];
    const isRTL = language === 'AR';

    useEffect(() => {
        if (currentUser?.language) {
            setLanguage(currentUser.language);
        }
    }, [currentUser]);

    const handleLanguageChange = async (newLang) => {
        setLanguage(newLang);
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await authAPI.updateSettings({ language: newLang });
            setSuccess(translations[newLang].success);
            if (onLanguageChange) {
                onLanguageChange(newLang);
            }
        } catch (err) {
            setError(err.message || translations[newLang].error);
            setLanguage(currentUser?.language || 'EN'); // Revert on error
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
            setError(t.bothRequired);
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.updateSettings({
                secret_phrase: secretPhrase,
                secret_answer: secretAnswer,
            });
            setSuccess(t.success);
            setSecretPhrase('');
            setSecretAnswer('');
        } catch (err) {
            setError(err.message || t.error);
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
                        <span className="eyebrow">{t.eyebrow}</span>
                        <h1 className="auth-title">{t.title}</h1>
                        <p className="auth-subtitle">{t.subtitle}</p>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="form-group">
                    <label className="label">{t.languageLabel}</label>
                    <div className="language-toggle" style={{ marginTop: '8px' }}>
                        {Object.keys(translations).map((lang) => (
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
                            {t.secretPhraseLabel}
                        </label>
                        <input
                            id="secret-phrase"
                            className="input-field"
                            type="text"
                            value={secretPhrase}
                            onChange={(e) => setSecretPhrase(e.target.value)}
                            placeholder={t.secretPhraseLabel}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="secret-answer">
                            {t.secretAnswerLabel}
                        </label>
                        <input
                            id="secret-answer"
                            className="input-field"
                            type="password"
                            value={secretAnswer}
                            onChange={(e) => setSecretAnswer(e.target.value)}
                            placeholder={t.secretAnswerLabel}
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
                        {isLoading ? 'Updating...' : t.updateBtn}
                    </button>
                </form>

                {/* Logout Button */}
                <button
                    className="primary-btn"
                    onClick={handleLogout}
                    style={{ marginTop: '16px', backgroundColor: '#ff4444' }}
                >
                    {t.logoutBtn}
                </button>
            </section>
        </div>
    );
};

export default SettingsPage;

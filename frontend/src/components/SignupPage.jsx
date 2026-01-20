import { useState } from 'react';
import { authAPI } from '../services/api';
import './AuthPages.css';

const translations = {
    EN: {
        eyebrow: 'Signup',
        title: 'Join SayTruth',
        subtitle: 'Pick a username and a secret phrase to recover your account later.',
        username: 'Username',
        secret: 'Secret Phrase',
        terms: 'I agree to the Terms & Conditions',
        signup: 'Create account',
        errorTaken: 'This username is already taken.',
        success: 'Account created. Redirecting...',
        forgot: 'Forgot secret phrase?',
        helper: 'Soft blues, touch-friendly, animated inputs.',
    },
    AR: {
        eyebrow: 'إنشاء حساب',
        title: 'انضم إلى SayTruth',
        subtitle: 'اختر اسم مستخدم وعبارة سرية لاستعادة حسابك لاحقًا.',
        username: 'اسم المستخدم',
        secret: 'العبارة السرية',
        terms: 'أوافق على الشروط والأحكام',
        signup: 'إنشاء حساب',
        errorTaken: 'اسم المستخدم محجوز.',
        success: 'تم إنشاء الحساب. جارٍ التحويل...',
        forgot: 'نسيت العبارة السرية؟',
        helper: 'ألوان هادئة، ملائم للمس، مدخلات متحركة.',
    },
    ES: {
        eyebrow: 'Registro',
        title: 'Únete a SayTruth',
        subtitle: 'Elige un usuario y una frase secreta para recuperar tu cuenta.',
        username: 'Usuario',
        secret: 'Frase secreta',
        terms: 'Acepto los Términos y Condiciones',
        signup: 'Crear cuenta',
        errorTaken: 'Ese usuario ya existe.',
        success: 'Cuenta creada. Redirigiendo...',
        forgot: '¿Olvidaste la frase secreta?',
        helper: 'Azules suaves, táctil, entradas animadas.',
    },
};

const SignupPage = ({ onSignupSuccess }) => {
    const [language, setLanguage] = useState('EN');
    const [username, setUsername] = useState('');
    const [secret, setSecret] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language];
    const isRTL = language === 'AR';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim() || !secret.trim()) {
            setError('All fields are required');
            return;
        }
        if (!acceptTerms) {
            setError(t.terms);
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.signup(username, secret);
            setSuccess(t.success);
            setTimeout(() => {
                if (onSignupSuccess) {
                    onSignupSuccess();
                }
            }, 1000);
        } catch (err) {
            setError(err.message || t.errorTaken);
        } finally {
            setIsLoading(false);
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
                    <div className="language-toggle" aria-label="Language selector">
                        {Object.keys(translations).map((lang) => (
                            <button
                                key={lang}
                                className={`lang-pill ${language === lang ? 'active' : ''}`}
                                onClick={() => setLanguage(lang)}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="helper-row">
                    <span className="badge">{t.helper}</span>
                    <span className="badge">Docker-ready UI mock</span>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="username">{t.username}</label>
                            <span className="hint">live check</span>
                        </div>
                        <input
                            id="username"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t.username}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="secret">{t.secret}</label>
                            <span className="hint">private</span>
                        </div>
                        <input
                            id="secret"
                            className="input-field"
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder={t.secret}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <label className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                        />
                        {t.terms}
                    </label>

                    {error && <div className="error-banner" role="alert">{error}</div>}
                    {success && <div className="success-banner" role="status">{success}</div>}

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : t.signup}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default SignupPage;

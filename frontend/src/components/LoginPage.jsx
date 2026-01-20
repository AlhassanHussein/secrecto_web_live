import { useState } from 'react';
import { authAPI } from '../services/api';
import './AuthPages.css';

const translations = {
    EN: {
        eyebrow: 'Login',
        title: 'Welcome back',
        subtitle: 'Enter your username and secret phrase to continue.',
        username: 'Username',
        secret: 'Secret Phrase',
        login: 'Login',
        forgot: 'Forgot secret phrase?',
        helper: 'Soft blues, smooth inputs, touch-friendly.',
        hint: 'Your secret phrase reminder is stored securely.',
        error: 'Invalid credentials. Try again.',
    },
    AR: {
        eyebrow: 'تسجيل الدخول',
        title: 'مرحبًا بعودتك',
        subtitle: 'أدخل اسم المستخدم والعبارة السرية للمتابعة.',
        username: 'اسم المستخدم',
        secret: 'العبارة السرية',
        login: 'دخول',
        forgot: 'نسيت العبارة السرية؟',
        helper: 'ألوان هادئة، مدخلات سلسة، ملائم للمس.',
        hint: 'تذكير العبارة السرية محفوظ بأمان.',
        error: 'بيانات الدخول غير صحيحة.',
    },
    ES: {
        eyebrow: 'Ingresar',
        title: 'Bienvenido de nuevo',
        subtitle: 'Ingresa tu usuario y frase secreta para continuar.',
        username: 'Usuario',
        secret: 'Frase secreta',
        login: 'Entrar',
        forgot: '¿Olvidaste la frase secreta?',
        helper: 'Azules suaves, inputs fluidos, listo para táctil.',
        hint: 'Tu recordatorio de frase secreta está guardado.',
        error: 'Credenciales inválidas. Intenta de nuevo.',
    },
};

const LoginPage = ({ onLoginSuccess }) => {
    const [language, setLanguage] = useState('EN');
    const [username, setUsername] = useState('');
    const [secret, setSecret] = useState('');
    const [error, setError] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language];
    const isRTL = language === 'AR';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !secret.trim()) {
            setError(t.error);
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.login(username, secret);
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
                    <span className="badge">Remember: 1 message/session rule</span>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="login-username">{t.username}</label>
                            <span className="hint">required</span>
                        </div>
                        <input
                            id="login-username"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t.username}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="label" htmlFor="login-secret">{t.secret}</label>
                            <span className="hint">private</span>
                        </div>
                        <input
                            id="login-secret"
                            className="input-field"
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder={t.secret}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    {error && <div className="error-banner" role="alert">{error}</div>}

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : t.login}
                    </button>
                </form>

                <div className="secondary-link" onClick={() => setShowHint(!showHint)}>
                    {t.forgot}
                </div>
                {showHint && <div className="success-banner" role="status">{t.hint}</div>}
            </section>
        </div>
    );
};

export default LoginPage;

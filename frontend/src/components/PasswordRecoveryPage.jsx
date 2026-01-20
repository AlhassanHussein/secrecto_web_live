import { useState } from 'react';
import { authAPI } from '../services/api';
import './AuthPages.css';

const translations = {
    EN: {
        eyebrow: 'Password Recovery',
        title: 'Recover Your Account',
        subtitle: 'Enter your username to see your secret phrase hint.',
        step1Title: 'Step 1: Enter Username',
        step2Title: 'Step 2: Answer Your Secret Phrase',
        username: 'Username',
        secretPhrase: 'Your Secret Phrase Hint',
        secretAnswer: 'Secret Answer',
        getHintBtn: 'Get My Hint',
        recoverBtn: 'Recover Access',
        backToLogin: 'Back to Login',
        success: 'Access recovered! Redirecting...',
        errorNotFound: 'User not found',
        errorWrongAnswer: 'Incorrect answer. Try again.',
        helper: 'Secure recovery with your secret answer.',
    },
    AR: {
        eyebrow: 'استعادة كلمة المرور',
        title: 'استعد حسابك',
        subtitle: 'أدخل اسم المستخدم لرؤية تلميح العبارة السرية.',
        step1Title: 'الخطوة 1: أدخل اسم المستخدم',
        step2Title: 'الخطوة 2: أجب على عبارتك السرية',
        username: 'اسم المستخدم',
        secretPhrase: 'تلميح عبارتك السرية',
        secretAnswer: 'الإجابة السرية',
        getHintBtn: 'احصل على التلميح',
        recoverBtn: 'استعادة الوصول',
        backToLogin: 'العودة لتسجيل الدخول',
        success: 'تم استعادة الوصول! جارٍ التحويل...',
        errorNotFound: 'المستخدم غير موجود',
        errorWrongAnswer: 'إجابة خاطئة. حاول مرة أخرى.',
        helper: 'استعادة آمنة بإجابتك السرية.',
    },
    ES: {
        eyebrow: 'Recuperación de contraseña',
        title: 'Recupera tu cuenta',
        subtitle: 'Ingresa tu usuario para ver la pista de tu frase secreta.',
        step1Title: 'Paso 1: Ingresa tu usuario',
        step2Title: 'Paso 2: Responde tu frase secreta',
        username: 'Usuario',
        secretPhrase: 'Pista de tu frase secreta',
        secretAnswer: 'Respuesta secreta',
        getHintBtn: 'Obtener pista',
        recoverBtn: 'Recuperar acceso',
        backToLogin: 'Volver al inicio',
        success: '¡Acceso recuperado! Redirigiendo...',
        errorNotFound: 'Usuario no encontrado',
        errorWrongAnswer: 'Respuesta incorrecta. Intenta de nuevo.',
        helper: 'Recuperación segura con tu respuesta.',
    },
};

const PasswordRecoveryPage = ({ onRecoverySuccess, onBackToLogin }) => {
    const [language, setLanguage] = useState('EN');
    const [step, setStep] = useState(1); // Step 1: Get hint, Step 2: Verify answer
    const [username, setUsername] = useState('');
    const [secretPhrase, setSecretPhrase] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const t = translations[language];
    const isRTL = language === 'AR';

    const handleGetHint = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.recoverPassword(username);
            setSecretPhrase(response.secret_phrase);
            setStep(2);
        } catch (err) {
            setError(err.message || t.errorNotFound);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAnswer = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!secretAnswer.trim()) {
            setError('Secret answer is required');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.verifyRecovery(username, secretAnswer);
            setSuccess(t.success);
            setTimeout(() => {
                if (onRecoverySuccess) {
                    onRecoverySuccess();
                }
            }, 1000);
        } catch (err) {
            setError(err.message || t.errorWrongAnswer);
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
                    <span className="badge">Step {step} of 2</span>
                </div>

                {step === 1 ? (
                    <form className="auth-form" onSubmit={handleGetHint}>
                        <h3 className="eyebrow" style={{ marginBottom: '16px' }}>{t.step1Title}</h3>
                        <div className="form-group">
                            <label className="label" htmlFor="username">{t.username}</label>
                            <input
                                id="username"
                                className="input-field"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={t.username}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {error && <div className="error-banner" role="alert">{error}</div>}

                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? 'Loading...' : t.getHintBtn}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleVerifyAnswer}>
                        <h3 className="eyebrow" style={{ marginBottom: '16px' }}>{t.step2Title}</h3>
                        
                        <div className="form-group">
                            <label className="label">{t.secretPhrase}</label>
                            <div className="success-banner" role="status" style={{ marginTop: '8px' }}>
                                {secretPhrase}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="secret-answer">{t.secretAnswer}</label>
                            <input
                                id="secret-answer"
                                className="input-field"
                                type="password"
                                value={secretAnswer}
                                onChange={(e) => setSecretAnswer(e.target.value)}
                                placeholder={t.secretAnswer}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {error && <div className="error-banner" role="alert">{error}</div>}
                        {success && <div className="success-banner" role="status">{success}</div>}

                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : t.recoverBtn}
                        </button>
                    </form>
                )}

                <div
                    className="secondary-link"
                    onClick={() => onBackToLogin && onBackToLogin()}
                    style={{ cursor: 'pointer', marginTop: '16px' }}
                >
                    {t.backToLogin}
                </div>
            </section>
        </div>
    );
};

export default PasswordRecoveryPage;

import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';

const translations = {
  EN: {
    eyebrow: 'Home',
    title: 'Create Anonymous Link',
    subtitle: 'Generate a temporary link to receive anonymous messages',
    displayName: 'Display Name (optional)',
    displayNamePlaceholder: 'What to call this link?',
    expiration: 'Link Expires In',
    option6h: '6 hours',
    option12h: '12 hours',
    option24h: '24 hours',
    option7d: '7 days',
    option30d: '30 days',
    permanent: 'Permanent (logged-in only)',
    generate: 'Generate Link',
    generating: 'Generating...',
    success: 'Link Created!',
    copy: 'Copy',
    copied: 'Copied!',
    publicLink: 'Public Link (share this to receive messages)',
    privateLink: 'Private Link (keep this to view messages)',
    expiresAt: 'Expires at',
    never: 'Never',
    countdown: 'Time remaining',
    newLink: 'Create Another Link',
    error: 'Failed to create link',
  },
  AR: {
    eyebrow: 'الرئيسية',
    title: 'إنشاء رابط مجهول',
    subtitle: 'قم بإنشاء رابط مؤقت لاستقبال رسائل مجهولة',
    displayName: 'اسم العرض (اختياري)',
    displayNamePlaceholder: 'ماذا تريد أن تسمي هذا الرابط؟',
    expiration: 'انتهاء صلاحية الرابط',
    option6h: '6 ساعات',
    option12h: '12 ساعة',
    option24h: '24 ساعة',
    option7d: '7 أيام',
    option30d: '30 يوم',
    permanent: 'دائم (للمستخدمين المسجلين فقط)',
    generate: 'إنشاء الرابط',
    generating: 'جاري الإنشاء...',
    success: 'تم إنشاء الرابط!',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    publicLink: 'الرابط العام (شارك هذا لاستقبال الرسائل)',
    privateLink: 'الرابط الخاص (احتفظ به لعرض الرسائل)',
    expiresAt: 'انتهاء الصلاحية في',
    never: 'لا تنتهي أبداً',
    countdown: 'الوقت المتبقي',
    newLink: 'إنشاء رابط جديد',
    error: 'فشل في إنشاء الرابط',
  },
  ES: {
    eyebrow: 'Inicio',
    title: 'Crear Enlace Anónimo',
    subtitle: 'Genera un enlace temporal para recibir mensajes anónimos',
    displayName: 'Nombre Mostrado (opcional)',
    displayNamePlaceholder: '¿Qué quieres llamar este enlace?',
    expiration: 'El Enlace Expira En',
    option6h: '6 horas',
    option12h: '12 horas',
    option24h: '24 horas',
    option7d: '7 días',
    option30d: '30 días',
    permanent: 'Permanente (solo usuarios registrados)',
    generate: 'Generar Enlace',
    generating: 'Generando...',
    success: '¡Enlace Creado!',
    copy: 'Copiar',
    copied: '¡Copiado!',
    publicLink: 'Enlace Público (comparte esto para recibir mensajes)',
    privateLink: 'Enlace Privado (guarda esto para ver mensajes)',
    expiresAt: 'Expira el',
    never: 'Nunca',
    countdown: 'Tiempo restante',
    newLink: 'Crear Otro Enlace',
    error: 'No se pudo crear el enlace',
  },
};

const HomeTab = ({ isLoggedIn = false, language = 'EN', onLinkCreated = null }) => {
  const [displayName, setDisplayName] = useState('');
  const [expirationOption, setExpirationOption] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const t = translations[language];
  const isRTL = language === 'AR';

  // Handle countdown timer
  useEffect(() => {
    if (!link || !link.expires_at) return;

    const updateCountdown = () => {
      const expiresAt = new Date(link.expires_at);
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setCountdown('Expired');
        setLink(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [link]);

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Guest users can't use permanent links
    if (!isLoggedIn && expirationOption === 'permanent') {
      setError('Permanent links are only for logged-in users');
      setLoading(false);
      return;
    }

    try {
      const newLink = await linksAPI.createLink(displayName || null, expirationOption);
      setLink(newLink);
      // Callback when link is created
      if (onLinkCreated) {
        onLinkCreated(newLink.private_id);
      }
    } catch (err) {
      setError(t.error);
      console.error('Failed to create link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleNewLink = () => {
    setLink(null);
    setDisplayName('');
    setExpirationOption('24h');
    setError(null);
  };

  return (
    <div className={`home-tab ${isRTL ? 'rtl' : ''}`}>
      <section className="hero card">
        <div className="hero-copy">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="hero-title">{t.title}</h1>
          <p className="hero-subtitle">{t.subtitle}</p>
        </div>
      </section>

      {!link ? (
        <section className="form-section card">
          <form onSubmit={handleGenerateLink}>
            <div className="form-group">
              <label htmlFor="displayName">{t.displayName}</label>
              <input
                id="displayName"
                type="text"
                placeholder={t.displayNamePlaceholder}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength="100"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiration">{t.expiration}</label>
              <select
                id="expiration"
                value={expirationOption}
                onChange={(e) => setExpirationOption(e.target.value)}
                className="form-select"
              >
                <option value="6h">{t.option6h}</option>
                <option value="12h">{t.option12h}</option>
                <option value="24h">{t.option24h}</option>
                <option value="7d">{t.option7d}</option>
                <option value="30d">{t.option30d}</option>
                {isLoggedIn && <option value="permanent">{t.permanent}</option>}
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn primary"
            >
              {loading ? t.generating : t.generate}
            </button>
          </form>
        </section>
      ) : (
        <section className="success-section card">
          <div className="success-header">
            <h2>{t.success}</h2>
            {countdown && (
              <div className="countdown-badge">
                {t.countdown}: <strong>{countdown}</strong>
              </div>
            )}
          </div>

          <div className="link-display">
            <div className="link-box">
              <label className="link-label">{t.publicLink}</label>
              <div className="link-content">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/link/${link.public_id}`}
                  className="link-input"
                />
                <button
                  className="copy-btn"
                  onClick={() =>
                    handleCopy(
                      `${window.location.origin}/link/${link.public_id}`,
                      0
                    )
                  }
                >
                  {copiedIndex === 0 ? t.copied : t.copy}
                </button>
              </div>
            </div>

            <div className="link-box">
              <label className="link-label">{t.privateLink}</label>
              <div className="link-content">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/link/private/${link.private_id}`}
                  className="link-input"
                />
                <button
                  className="copy-btn"
                  onClick={() =>
                    handleCopy(
                      `${window.location.origin}/link/private/${link.private_id}`,
                      1
                    )
                  }
                >
                  {copiedIndex === 1 ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>

          {link.display_name && (
            <div className="link-info">
              <strong>Name:</strong> {link.display_name}
            </div>
          )}

          <div className="link-info">
            <strong>{t.expiresAt}:</strong>{' '}
            {link.expires_at
              ? new Date(link.expires_at).toLocaleString()
              : t.never}
          </div>

          <button className="btn primary" onClick={handleNewLink}>
            {t.newLink}
          </button>
        </section>
      )}
    </div>
  );
};

export default HomeTab;

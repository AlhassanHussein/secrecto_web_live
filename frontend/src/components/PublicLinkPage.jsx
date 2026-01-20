import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';

const translations = {
  EN: {
    eyebrow: 'Send Message',
    loading: 'Loading link...',
    expired: 'This link has expired',
    notFound: 'Link not found',
    error: 'Error loading link',
    placeholder: 'Write your anonymous message here...',
    send: 'Send Message',
    sending: 'Sending...',
    success: 'Message sent!',
    sendAnother: 'Send Another',
    errors: 'Failed to send message',
  },
  AR: {
    eyebrow: 'إرسال الرسالة',
    loading: 'جاري تحميل الرابط...',
    expired: 'انتهت صلاحية هذا الرابط',
    notFound: 'لم يتم العثور على الرابط',
    error: 'حدث خطأ في تحميل الرابط',
    placeholder: 'اكتب رسالتك المجهولة هنا...',
    send: 'إرسال الرسالة',
    sending: 'جاري الإرسال...',
    success: 'تم إرسال الرسالة!',
    sendAnother: 'إرسال أخرى',
    errors: 'فشل إرسال الرسالة',
  },
  ES: {
    eyebrow: 'Enviar Mensaje',
    loading: 'Cargando enlace...',
    expired: 'Este enlace ha expirado',
    notFound: 'Enlace no encontrado',
    error: 'Error al cargar el enlace',
    placeholder: 'Escribe tu mensaje anónimo aquí...',
    send: 'Enviar Mensaje',
    sending: 'Enviando...',
    success: '¡Mensaje enviado!',
    sendAnother: 'Enviar Otro',
    errors: 'No se pudo enviar el mensaje',
  },
};

const PublicLinkPage = ({ publicId, language = 'EN' }) => {
  const [linkInfo, setLinkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[language];
  const isRTL = language === 'AR';

  useEffect(() => {
    const fetchLinkInfo = async () => {
      try {
        setLoading(true);
        const info = await linksAPI.getLinkInfo(publicId);
        setLinkInfo(info);
      } catch (err) {
        if (err.message.includes('404')) {
          setError(t.notFound);
        } else if (err.message.includes('expired')) {
          setError(t.expired);
        } else {
          setError(t.error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLinkInfo();
  }, [publicId, t]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError(null);

    try {
      await linksAPI.sendLinkMessage(publicId, message);
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(t.errors);
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={`public-link-page ${isRTL ? 'rtl' : ''}`}>
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`public-link-page ${isRTL ? 'rtl' : ''}`}>
        <section className="error-section card">
          <div className="error-icon">❌</div>
          <p className="error-message">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className={`public-link-page ${isRTL ? 'rtl' : ''}`}>
      <section className="hero card">
        <div className="hero-copy">
          <span className="eyebrow">{t.eyebrow}</span>
          {linkInfo?.display_name && (
            <h1 className="hero-title">{linkInfo.display_name}</h1>
          )}
          <p className="hero-subtitle">
            Send an anonymous message to {linkInfo?.display_name || 'this user'}
          </p>
        </div>
      </section>

      <section className="form-section card">
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              placeholder={t.placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength="5000"
              rows="8"
              className="form-textarea"
              disabled={sending}
            />
            <div className="char-count">
              {message.length} / 5000
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {sent && <div className="success-message">{t.success}</div>}

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="btn primary"
          >
            {sending ? t.sending : t.send}
          </button>
        </form>
      </section>
    </div>
  );
};

export default PublicLinkPage;

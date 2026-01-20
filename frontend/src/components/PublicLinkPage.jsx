import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';

const translations = {
  EN: {
    eyebrow: 'Send Message',
    loading: 'Loading link...',
    expired: 'This link has expired and is no longer available.',
    notFound: 'Link not found',
    error: 'Error loading link',
    placeholder: 'Write your anonymous message here...',
    send: 'Send Message',
    sending: 'Sending...',
    success: '✓ Message sent! You can send more messages.',
    sendAnother: 'Send Another',
    errors: 'Failed to send message',
    sendAnonymous: 'Send an anonymous message',
    multipleAllowed: 'You can send multiple messages',
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
      <div className={`public-link-page ${isRTL ? 'rtl' : ''}`} style={{ padding: '2rem', maxWidth: '520px', margin: '0 auto' }}>
        <section className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>{error}</h2>
          {error.includes('expired') && (
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>This link can no longer accept messages.</p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className={`public-link-page ${isRTL ? 'rtl' : ''}`} style={{ padding: '1rem', maxWidth: '520px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>{t.eyebrow}</span>
        {linkInfo?.display_name && (
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0' }}>{linkInfo.display_name}</h1>
        )}
        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
          {t.sendAnonymous} • {t.multipleAllowed}
        </p>
      </section>

      <section className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSendMessage}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Your Message</label>
            <textarea
              placeholder={t.placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength="5000"
              rows="8"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--gray-200)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              disabled={sending}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', textAlign: 'right' }}>
              {message.length} / 5000
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', background: 'var(--error-light)', color: 'var(--error)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          {sent && (
            <div style={{ padding: '0.75rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {t.success}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="action primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          >
            {sending ? t.sending : t.send}
          </button>
        </form>
      </section>
    </div>
  );
};

export default PublicLinkPage;

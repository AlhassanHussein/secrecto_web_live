import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';

const translations = {
  EN: {
    eyebrow: 'Your Link',
    loading: 'Loading messages...',
    expired: 'This link has expired',
    error: 'Error loading messages',
    noMessages: 'No messages yet',
    inbox: 'Inbox',
    public: 'Public',
    deleted: 'Deleted',
    markPublic: 'Make Public',
    markPrivate: 'Mark Private',
    delete: 'Delete',
    restore: 'Restore',
    expiresIn: 'Link expires in',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    just_now: 'just now',
    ago: 'ago',
  },
  AR: {
    eyebrow: 'رابطك',
    loading: 'جاري تحميل الرسائل...',
    expired: 'انتهت صلاحية هذا الرابط',
    error: 'حدث خطأ في تحميل الرسائل',
    noMessages: 'لا توجد رسائل حتى الآن',
    inbox: 'الرسائل',
    public: 'عام',
    deleted: 'محذوفة',
    markPublic: 'اجعله عام',
    markPrivate: 'وضع علامة خاصة',
    delete: 'حذف',
    restore: 'استعادة',
    expiresIn: 'ينتهي الرابط في',
    days: 'أيام',
    hours: 'ساعات',
    minutes: 'دقائق',
    seconds: 'ثوان',
    just_now: 'للتو',
    ago: 'منذ',
  },
  ES: {
    eyebrow: 'Tu Enlace',
    loading: 'Cargando mensajes...',
    expired: 'Este enlace ha expirado',
    error: 'Error al cargar los mensajes',
    noMessages: 'Sin mensajes aún',
    inbox: 'Bandeja de entrada',
    public: 'Público',
    deleted: 'Eliminado',
    markPublic: 'Hacer Público',
    markPrivate: 'Marcar Privado',
    delete: 'Eliminar',
    restore: 'Restaurar',
    expiresIn: 'El enlace expira en',
    days: 'días',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    just_now: 'justo ahora',
    ago: 'hace',
  },
};

const formatTimeRemaining = (expiresAt, t) => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days} ${t.days}`;
  if (hours > 0) return `${hours} ${t.hours}`;
  if (minutes > 0) return `${minutes} ${t.minutes}`;
  return `${seconds} ${t.seconds}`;
};

const formatMessageTime = (createdAt, t) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t.just_now;
  if (diffMins < 60) return `${diffMins} ${t.minutes} ${t.ago}`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${t.hours} ${t.ago}`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${t.days} ${t.ago}`;
};

const MessageList = ({ messages, onMakePublic, onDelete, language, t }) => {
  const isRTL = language === 'AR';

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">{t.noMessages}</div>
      ) : (
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-card ${msg.status}`}>
              <div className="message-content">{msg.content}</div>
              <div className="message-meta">
                <span className="message-time">
                  {formatMessageTime(msg.created_at, t)}
                </span>
              </div>
              <div className={`message-actions ${isRTL ? 'rtl' : ''}`}>
               
                <button
                  onClick={() => onDelete(msg.id)}
                  className="action-btn delete"
                  title={t.delete}
                >
                 Delete 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PrivateLinkPage = ({ privateId, language = 'EN' }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');

  const t = translations[language];
  const isRTL = language === 'AR';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await linksAPI.getLinkMessages(privateId);
        // New backend structure: { messages, display_name, expires_at, status }
        setMessages(data?.messages || []);
        setExpiresAt(data?.expires_at || null);
      } catch (err) {
        setError(t.error);
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [privateId, t]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const remaining = formatTimeRemaining(expiresAt, t);
      setCountdown(remaining);
      if (!remaining) {
        setError(t.expired);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, t]);

  const handleMakePublic = async (messageId) => {
    try {
      await linksAPI.makeLinkMessagePublic(privateId, messageId);
      // Optimistic update
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'public' } : msg
        )
      );
    } catch (err) {
      setError('Failed to update message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await linksAPI.deleteLinkMessage(privateId, messageId);
      // Optimistic update: drop the message from view
      setMessages((msgs) => msgs.filter((msg) => msg.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
    }
  };

  // Show only inbox messages; public/deleted tabs removed for simplicity
  const inboxMessages = messages.filter((m) => m.status === 'inbox');

  if (loading) {
    return (
      <div className={`private-link-page ${isRTL ? 'rtl' : ''}`}>
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className={`private-link-page ${isRTL ? 'rtl' : ''}`}>
      <section className="hero card">
        <div className="hero-copy">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="hero-title">Your Anonymous Messages</h1>
          {countdown && (
            <p className="countdown">
              {t.expiresIn}: <strong>{countdown}</strong>
            </p>
          )}
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      <section className="messages-section card">
        <div className="section-header">
          <h2 className="section-title">{t.inbox} ({inboxMessages.length})</h2>
        </div>
        <MessageList
          messages={inboxMessages}
          onMakePublic={handleMakePublic}
          onDelete={handleDelete}
          language={language}
          t={t}
        />
      </section>
    </div>
  );
};

export default PrivateLinkPage;

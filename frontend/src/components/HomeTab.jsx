import { useState } from 'react';
import { linksAPI } from '../services/api';

const translations = {
  EN: {
    eyebrow: 'Create Link',
    title: 'Generate Temporary Link',
    subtitle: 'Create anonymous messaging links with expiration',
    displayName: 'Display Name (optional)',
    displayNamePlaceholder: 'e.g., Anonymous Feedback',
    expiration: 'Link Duration',
    createButton: 'Create Link',
    creating: 'Creating...',
    linksGenerated: 'Links Generated',
    publicLink: 'Public Link',
    publicDesc: 'Share this - anyone can send messages',
    privateLink: 'Private Link (Inbox)',
    privateDesc: 'Your inbox - view received messages',
    copyPublic: 'Copy Public',
    copyPrivate: 'Copy Private',
    copied: '✓ Copied',
    viewInbox: 'View Inbox',
    expiresIn: 'Expires in',
    guestWarning: 'To create links longer than 24 hours, please log in or create an account.',
    expirations: {
      '6h': '6 hours',
      '12h': '12 hours',
      '24h': '24 hours',
      '7d': '1 week',
      '30d': '1 month',
    },
  },
};

const HomeTab = ({ isAuthenticated, language = 'EN', onLinkCreated }) => {
  const [displayName, setDisplayName] = useState('');
  const [expiration, setExpiration] = useState('24h');
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  const t = translations[language];
  const guestExpirations = ['6h', '12h', '24h'];
  const loggedInExpirations = ['6h', '12h', '24h', '7d', '30d'];
  const availableExpirations = isAuthenticated ? loggedInExpirations : guestExpirations;

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated && !guestExpirations.includes(expiration)) {
      setShowGuestWarning(true);
      setTimeout(() => setShowGuestWarning(false), 5000);
      return;
    }

    setCreating(true);
    setShowGuestWarning(false);

    try {
      const link = await linksAPI.createLink({
        display_name: displayName || 'Anonymous',
        expiration_option: expiration,
      });
      
      setCreatedLink(link);
      setDisplayName('');
      if (onLinkCreated) onLinkCreated(link);
    } catch (err) {
      console.error('Failed to create link:', err);
      alert('Failed to create link. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'public') {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      } else {
        setCopiedPrivate(true);
        setTimeout(() => setCopiedPrivate(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getPublicUrl = (publicId) => `${window.location.origin}/link/public/${publicId}`;
  const getPrivateUrl = (privateId) => `${window.location.origin}/link/private/${privateId}`;

  const formatExpiration = (expiresAt) => {
    if (!expiresAt) return '';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return 'Less than 1 hour';
  };

  return (
    <div className="home-tab" style={{ padding: '1rem', maxWidth: '520px', margin: '0 auto' }}>
      <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>{t.eyebrow}</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0' }}>{t.title}</h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{t.subtitle}</p>
      </section>

      <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>{t.displayName}</label>
            <input
              type="text"
              placeholder={t.displayNamePlaceholder}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}
              maxLength="50"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>{t.expiration}</label>
            <select
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}
            >
              {availableExpirations.map((exp) => (
                <option key={exp} value={exp}>{t.expirations[exp]}</option>
              ))}
            </select>
          </div>

          {showGuestWarning && (
            <div style={{ padding: '0.75rem', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              ⚠️ {t.guestWarning}
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="action primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          >
            {creating ? t.creating : t.createButton}
          </button>
        </form>
      </section>

      {createdLink && (
        <section className="card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.linksGenerated}</h2>
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {t.expiresIn}: {formatExpiration(createdLink.expires_at)}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🌍</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{t.publicLink}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{t.publicDesc}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  /link/public/{createdLink.public_id}
                </div>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(getPublicUrl(createdLink.public_id), 'public')}
              className="action primary"
              style={{ width: '100%' }}
            >
              {copiedPublic ? t.copied : t.copyPublic}
            </button>
          </div>

          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{t.privateLink}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{t.privateDesc}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  /link/private/{createdLink.private_id}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => copyToClipboard(getPrivateUrl(createdLink.private_id), 'private')}
                className="action outline"
                style={{ flex: 1 }}
              >
                {copiedPrivate ? t.copied : t.copyPrivate}
              </button>
              <a
                href={`/link/private/${createdLink.private_id}`}
                className="action primary"
                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {t.viewInbox}
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeTab;

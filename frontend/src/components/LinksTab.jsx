import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';
import './LinksTab.css';

const LinksTab = ({ isAuthenticated }) => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    // Creation states
    const [displayName, setDisplayName] = useState('');
    const [expiration, setExpiration] = useState('24h');
    const [creating, setCreating] = useState(false);
    const [createdLink, setCreatedLink] = useState(null);
    const [copiedPublic, setCopiedPublic] = useState(false);
    const [copiedPrivate, setCopiedPrivate] = useState(false);
    const [showGuestWarning, setShowGuestWarning] = useState(false);

    const guestExpirations = ['6h', '12h', '24h'];
    const loggedInExpirations = ['6h', '12h', '24h', '7d', '30d'];
    const availableExpirations = isAuthenticated ? loggedInExpirations : guestExpirations;

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserLinks();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchUserLinks = async () => {
        try {
            setLoading(true);
            const userLinks = await linksAPI.getUserLinks();
            setLinks(userLinks);
        } catch (err) {
            console.error('Failed to load links:', err);
            setLinks([]);
        } finally {
            setLoading(false);
        }
    };

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
            if (isAuthenticated) {
                fetchUserLinks();
            }
        } catch (err) {
            console.error('Failed to create link:', err);
            alert('Failed to create link. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = async (url, id) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const copyCreated = async (url, type) => {
        try {
            await navigator.clipboard.writeText(url);
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

    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return 'Permanent';

        const now = new Date();
        const expires = new Date(expiresAt);
        const remaining = expires - now;

        if (remaining <= 0) return 'Expired';

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const isExpired = (expiresAt) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) <= new Date();
    };

    const formatExpiration = (expiresAt) => {
        if (!expiresAt) return 'Permanent';
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

    if (loading) {
        return (
            <div className="links-tab" style={{ padding: '2rem', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <p>Loading your links...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="links-tab" style={{ padding: '1rem', maxWidth: '520px', margin: '0 auto', paddingBottom: '6rem' }}>
            {/* Create link */}
            <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Create Link</span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0' }}>Generate Temporary Link</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Create anonymous messaging links with expiration</p>
            </section>

            <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                <form onSubmit={handleCreate}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Display Name (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Anonymous Feedback"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}
                            maxLength="50"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Link Duration</label>
                        <select
                            value={expiration}
                            onChange={(e) => setExpiration(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}
                        >
                            {availableExpirations.map((exp) => (
                                <option key={exp} value={exp}>{
                                    {
                                        '6h': '6 hours',
                                        '12h': '12 hours',
                                        '24h': '24 hours',
                                        '7d': '1 week',
                                        '30d': '1 month'
                                    }[exp]
                                }</option>
                            ))}
                        </select>
                    </div>

                    {showGuestWarning && (
                        <div style={{ padding: '0.75rem', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            ⚠️ To create links longer than 24 hours, please log in.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={creating}
                        className="action primary"
                        style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
                    >
                        {creating ? 'Creating...' : 'Create Link'}
                    </button>
                </form>
            </section>

            {createdLink && (
                <section className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Links Generated</h2>
                        <div style={{ padding: '0.5rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                            Expires in: {formatExpiration(createdLink.expires_at)}
                        </div>
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🌍</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Public Link</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Share this - anyone can send messages</p>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                    /link/public/{createdLink.public_id}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => copyCreated(getPublicUrl(createdLink.public_id), 'public')}
                            className="action primary"
                            style={{ width: '100%' }}
                        >
                            {copiedPublic ? '✓ Copied' : 'Copy Public'}
                        </button>
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔒</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Private Link (Inbox)</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Your inbox - view received messages</p>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                    /link/private/{createdLink.private_id}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => copyCreated(getPrivateUrl(createdLink.private_id), 'private')}
                                className="action outline"
                                style={{ flex: 1 }}
                            >
                                {copiedPrivate ? '✓ Copied' : 'Copy Private'}
                            </button>
                            <a
                                href={`/link/private/${createdLink.private_id}`}
                                className="action primary"
                                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                View Inbox
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* My links (auth only) */}
            <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Links</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Manage your anonymous messaging links</p>
            </section>

            {!isAuthenticated && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Log in to view saved links</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Guest-created links are not saved. Sign in to keep and manage your links.
                    </p>
                </div>
            )}

            {isAuthenticated && (
                links.length === 0 ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No links yet</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                            Create a link above to get started
                        </p>
                    </div>
                ) : (
                    links.map((link) => {
                        const expired = isExpired(link.expires_at);
                        const publicUrl = getPublicUrl(link.public_id);
                        const privateUrl = getPrivateUrl(link.private_id);

                        return (
                            <div key={link.public_id} className="card" style={{ marginBottom: '1rem', padding: '1.5rem', opacity: expired ? 0.6 : 1 }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{link.display_name || 'Anonymous'}</h3>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: expired ? 'var(--gray-200)' : 'var(--primary-light)',
                                            color: expired ? 'var(--gray-600)' : 'var(--primary)'
                                        }}>
                                            {expired ? '⏰ Expired' : `⏱ ${getTimeRemaining(link.expires_at)}`}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                        Created {new Date(link.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1rem' }}>🌍</span>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)' }}>Public Link</label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={publicUrl}
                                            readOnly
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid var(--gray-200)',
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                background: 'var(--gray-50)'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleCopy(publicUrl, `public-${link.public_id}`)}
                                            disabled={expired}
                                            className="action outline"
                                            style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                                        >
                                            {copiedId === `public-${link.public_id}` ? '✓ Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1rem' }}>🔒</span>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)' }}>Private Link (Inbox)</label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={privateUrl}
                                            readOnly
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid var(--gray-200)',
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                background: 'var(--gray-50)'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleCopy(privateUrl, `private-${link.private_id}`)}
                                            className="action outline"
                                            style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                                        >
                                            {copiedId === `private-${link.private_id}` ? '✓ Copied' : 'Copy'}
                                        </button>
                                        <a
                                            href={privateUrl}
                                            className="action primary"
                                            style={{ whiteSpace: 'nowrap', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            View
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )
            )}
        </div>
    );
};

export default LinksTab;

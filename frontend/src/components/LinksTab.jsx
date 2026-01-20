import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';
import './LinksTab.css';

const LinksTab = ({ isAuthenticated }) => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

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

    const handleCopy = async (url, id) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
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

    if (!isAuthenticated) {
        return (
            <div className="links-tab" style={{ padding: '2rem', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Please log in to see your created links. Guest links are not saved.
                    </p>
                </div>
            </div>
        );
    }

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
            <section className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Links</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Manage your anonymous messaging links</p>
            </section>

            {links.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No links yet</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Create a link from the Home tab to get started
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
            )}
        </div>
    );
};

export default LinksTab;

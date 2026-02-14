'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('devle_token', res.data.data.token);
                localStorage.setItem('devle_refresh', res.data.data.refreshToken);
                localStorage.setItem('devle_user', JSON.stringify(res.data.data.user));
                router.push('/');
            }
        } catch (e: any) {
            setError(e.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid var(--grid-border)',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '20px',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '380px',
                padding: '40px 32px',
                background: 'rgba(22, 27, 34, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(48, 54, 61, 0.6)',
                borderRadius: '14px',
            }}>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '28px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: '4px',
                    color: 'var(--accent-primary)',
                    textShadow: '0 0 16px rgba(0,255,136,0.5)',
                    letterSpacing: '-0.02em',
                }}>
                    {'<'}LOGIN{' />'}
                </h1>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    textAlign: 'center',
                    marginBottom: '28px',
                    letterSpacing: '0.06em',
                }}>
                    AUTHENTICATE TO SAVE PROGRESS
                </p>

                {error && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,59,59,0.1)',
                        border: '1px solid rgba(255,59,59,0.25)',
                        color: '#FF6B6B',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        marginBottom: '16px',
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--accent-primary)',
                        color: '#0D1117',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        letterSpacing: '0.06em',
                        marginTop: '4px',
                    }}>
                        {loading ? 'LOADING...' : 'ENTER →'}
                    </button>
                </form>

                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    textAlign: 'center',
                    marginTop: '20px',
                }}>
                    No account?{' '}
                    <a href="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>REGISTER</a>
                    {' · '}
                    <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>PLAY AS GUEST</a>
                </p>
            </div>
        </div>
    );
}

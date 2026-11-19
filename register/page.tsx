'use client';
import Link from 'next/link';
import BackArrow from '@/components/BackArrow';
import { signIn } from 'next-auth/react';
import { useLang } from '@/app/layout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function RegisterPage() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const content = {
    EN: {
      title: "Create New Account ✨",
      subtitle: "Join the Kashafa family and get 50 welcome points!",
      googleBtn: "Continue with Google",
      orEmail: "Or with email",
      namePlaceholder: "Full Name",
      emailPlaceholder: "Email Address",
      passwordPlaceholder: "Password",
      submitBtn: "Create Account",
      submittingBtn: "Creating Account...",
      hasAccount: "Already have an account?",
      loginLink: "Sign in"
    },
    AR: {
      title: "إنشاء حساب جديد ✨",
      subtitle: "انضم لعائلة كشافة واكسب 50 نقطة ترحيبية فوراً!",
      googleBtn: "المتابعة بواسطة Google",
      orEmail: "أو بالبريد الإلكتروني",
      namePlaceholder: "الاسم الكامل",
      emailPlaceholder: "البريد الإلكتروني",
      passwordPlaceholder: "كلمة المرور",
      submitBtn: "تسجيل حساب",
      submittingBtn: "جاري إنشاء الحساب...",
      hasAccount: "لديك حساب بالفعل؟",
      loginLink: "سجل دخولك"
    }
  };

  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const newUserPayload = {
      fullName,
      email: email.trim(),
      password,
      points: 50, // 50 نقطة هدية التسجيل
      createdAt: new Date().toISOString()
    };

    try {
      // 1. محاولة حفظ المستخدم الجديد في قاعدة البيانات عبر الباك إند الـ API
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload)
      });
      
      const json = await res.json();

      if (res.ok) {
        localStorage.setItem('kashafa_current_user', JSON.stringify(json.user || newUserPayload));
        window.dispatchEvent(new Event('storage'));
        router.push('/profile');
        return;
      } else {
        setErrorMsg(json.message || (isAr ? 'البريد الإلكتروني مسجل بالفعل أو حدث خطأ' : 'Email already registered or error occurred'));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Server registration fallback to local storage');
    }

    // 2. خيار احتياطي محلي (LocalStorage) لو السيرفر مش شغال
    try {
      const existingUsers = JSON.parse(localStorage.getItem('kashafa_users') || '[]');
      const found = existingUsers.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (found) {
        setErrorMsg(isAr ? 'البريد الإلكتروني مسجل بالفعل. جرب تسجيل الدخول.' : 'Email is already registered. Try signing in.');
        setLoading(false);
        return;
      }

      existingUsers.push(newUserPayload);
      localStorage.setItem('kashafa_users', JSON.stringify(existingUsers));
      localStorage.setItem('kashafa_current_user', JSON.stringify(newUserPayload));

      window.dispatchEvent(new Event('storage'));
      router.push('/profile');
    } catch (localErr) {
      setErrorMsg(isAr ? 'حدث خطأ، برجاء المحاولة مرة أخرى' : 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#F5F2EC', 
      minHeight: '80vh', 
      padding: '40px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      direction: isAr ? 'rtl' : 'ltr',
      textAlign: isAr ? 'right' : 'left'
    }}>
      <div style={{ 
        maxWidth: '450px', 
        width: '100%', 
        backgroundColor: '#FFFFFF', 
        padding: '40px', 
        borderRadius: '24px', 
        border: '1px solid #DAD8D2', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)' 
      }}>
        
        <BackArrow />
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: '#20232B' }}>{t.title}</h1>
        <p style={{ color: '#666', marginBottom: '25px', fontSize: '0.9rem' }}>{t.subtitle}</p>

        {errorMsg && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {/* زر جوجل */}
        <button 
          type="button" 
          onClick={() => signIn('google', { callbackUrl: '/profile' })}
          style={{ 
            width: '100%', backgroundColor: '#FFFFFF', color: '#20232B', border: '1px solid #DAD8D2', 
            padding: '13px', borderRadius: '25px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.18 21.35 7.28 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.19C.43 8.15 0 9.89 0 12s.43 3.85 1.19 5.4l4.08-3.16z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.18 2.65 1.19 6.6l4.08 3.16c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          {t.googleBtn}
        </button>

        {/* خط فاصل */}
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#888', margin: '20px 0', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, borderBottom: '1px solid #DAD8D2' }}></div>
          <span style={{ padding: '0 10px' }}>{t.orEmail}</span>
          <div style={{ flex: 1, borderBottom: '1px solid #DAD8D2' }}></div>
        </div>

        {/* نموذج التسجيل */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t.namePlaceholder} 
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none', fontSize: '0.95rem', textAlign: isAr ? 'right' : 'left' }} 
          />
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder} 
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none', fontSize: '0.95rem', textAlign: isAr ? 'right' : 'left' }} 
          />
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder} 
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none', fontSize: '0.95rem', textAlign: isAr ? 'right' : 'left' }} 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', 
              borderRadius: '25px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', 
              marginTop: '10px', opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? t.submittingBtn : t.submitBtn}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          {t.hasAccount}{' '}
          <Link href="/profile" style={{ color: '#2d473b', fontWeight: 'bold', textDecoration: 'none' }}>
            {t.loginLink}
          </Link>
        </p>

      </div>
    </div>
  );
}
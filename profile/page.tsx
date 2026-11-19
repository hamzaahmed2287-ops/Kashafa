'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';
import Link from 'next/link';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function ProfilePage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // بيانات المستخدم المسجل دخول
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // تحميل بيانات المستخدم ونقاطه وطلباته عند فتح الصفحة
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = JSON.parse(localStorage.getItem('kashafa_current_user') || 'null');
      if (savedUser) {
        try {
          // جلب بيانات المستخدم المحدثة (مثل النقاط) من الداتا بيز عبر الـ API إن وجد
          const dbUsers = await api.getUsers?.();
          const freshUser = dbUsers?.find((u: any) => u.email === savedUser.email) || savedUser;
          
          setCurrentUser(freshUser);
          localStorage.setItem('kashafa_current_user', JSON.stringify(freshUser));
        } catch (e) {
          setCurrentUser(savedUser);
        }

        // جلب الطلبات الخاصة بالمستخدم
        try {
          const dbOrders = await api.getOrders?.();
          const allOrders = (dbOrders && dbOrders.length > 0) ? dbOrders : JSON.parse(localStorage.getItem('kashafa_orders') || '[]');
          
          const myOrders = allOrders.filter(
            (o: any) => o.userEmail === savedUser.email || o.phone === savedUser.phone
          );
          setUserOrders(myOrders);
        } catch (err) {
          setUserOrders([]);
        }
      }
    };

    loadUserData();
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg(isAr ? 'برجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      // 1. محاولة تسجيل الدخول عبر الباك إند وقاعدة البيانات مباشرة
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();

      if (res.ok && json.user) {
        localStorage.setItem('kashafa_current_user', JSON.stringify(json.user));
        setCurrentUser(json.user);
        window.dispatchEvent(new Event('storage'));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Server login fallback to local storage');
    }

    // 2. خيار احتياطي من التخزين المحلي لو السيرفر مش شغال
    const users = JSON.parse(localStorage.getItem('kashafa_users') || '[]');
    const matchedUser = users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (matchedUser) {
      localStorage.setItem('kashafa_current_user', JSON.stringify(matchedUser));
      setCurrentUser(matchedUser);
      window.dispatchEvent(new Event('storage'));
    } else {
      setErrorMsg(
        isAr
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من إنشاء حساب أولاً.'
          : 'Invalid email or password. Please make sure you have created an account first.'
      );
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('kashafa_current_user');
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    window.dispatchEvent(new Event('storage'));
  };

  const content = {
    EN: {
      title: "My Profile",
      subtitle: "Sign in to track your orders and points wallet.",
      emailPlaceholder: "Email Address",
      passwordPlaceholder: "Password",
      loginBtn: "Sign In",
      loggingIn: "Signing in...",
      noAccount: "Don't have an account?",
      createAccount: "Create a new account",
      welcome: "Welcome back,",
      walletTitle: "KASHAFA Points Wallet",
      pointsUnit: "Points",
      walletHint: "Earn 50 points on registration + 10% of every order value as points!",
      ordersTitle: "My Orders",
      noOrders: "You haven't placed any orders yet.",
      trackBtn: "Track Order",
      logoutBtn: "Sign Out"
    },
    AR: {
      title: "حسابي الشخصي",
      subtitle: "قم بتسجيل الدخول لمتابعة طلباتك ومحفظة النقاط.",
      emailPlaceholder: "البريد الإلكتروني",
      passwordPlaceholder: "كلمة المرور",
      loginBtn: "تسجيل الدخول",
      loggingIn: "جاري الدخول...",
      noAccount: "ليس لديك حساب؟",
      createAccount: "أنشئ حساب جديد",
      welcome: "أهلاً بك،",
      walletTitle: "محفظة نقاط كشافة",
      pointsUnit: "نقطة",
      walletHint: "تكسب 50 نقطة عند التسجيل + نقاط إضافية مع كل طلب جديد!",
      ordersTitle: "طلباتي السابقة",
      noOrders: "لا توجد طلبات مسجلة على حسابك حتى الآن.",
      trackBtn: "تتبع الطلب",
      logoutBtn: "تسجيل الخروج"
    }
  };

  const t = content[lang];

  // في حالة تسجيل الدخول: عرض محفظة النقاط والطلبات
  if (currentUser) {
    const userPoints = currentUser.points || 0;
    const egpValue = Math.floor(userPoints / 10);

    return (
      <div style={{ backgroundColor: '#F5F2EC', minHeight: '85vh', padding: '40px 20px', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* بطاقة الترحيب وتسجيل الخروج */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid #DAD8D2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#20232B', margin: 0 }}>
                {t.welcome} {currentUser.fullName || currentUser.name || currentUser.email}
              </h1>
              <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>{currentUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#F5F2EC', color: '#20232B', border: '1px solid #DAD8D2', padding: '10px 20px', borderRadius: '25px', fontWeight: '700', cursor: 'pointer' }}
            >
              {t.logoutBtn}
            </button>
          </div>

          {/* بطاقة محفظة النقاط */}
          <div style={{ backgroundColor: '#20232B', color: '#F5F2EC', padding: '32px', borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ backgroundColor: '#A6C96A', color: '#20232B', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900' }}>
                ★ VIP REWARDS
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '12px', marginBottom: '6px' }}>{t.walletTitle}</h2>
              <p style={{ color: '#DAD8D2', fontSize: '0.88rem', margin: 0 }}>{t.walletHint}</p>
            </div>
            <div style={{ textAlign: isAr ? 'left' : 'right', backgroundColor: 'rgba(255,255,255,0.06)', padding: '18px 28px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#A6C96A', lineHeight: 1 }}>
                {userPoints} <span style={{ fontSize: '1rem', color: '#F5F2EC' }}>{t.pointsUnit}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#DAD8D2', marginTop: '6px' }}>
                {isAr ? `تساوي خصم بقيمة ${egpValue} ج.م` : `Equals ${egpValue} EGP discount`}
              </div>
            </div>
          </div>

          {/* سجل طلبات العميل */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#20232B', marginBottom: '18px' }}>{t.ordersTitle}</h2>
            {userOrders.length === 0 ? (
              <p style={{ color: '#666', fontSize: '0.95rem' }}>{t.noOrders}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userOrders.map((order) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', border: '1px solid #DAD8D2', backgroundColor: '#F9F8F6', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#20232B', fontSize: '1rem' }}>{order.id}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '3px' }}>
                        {order.totalAmount || order.total} {isAr ? 'ج.م' : 'EGP'} • {order.governorate}
                      </div>
                    </div>
                    <Link
                      href={`/track-order?id=${order.id}`}
                      style={{ backgroundColor: '#20232B', color: '#F5F2EC', padding: '9px 18px', borderRadius: '20px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                    >
                      {t.trackBtn}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // في حالة عدم تسجيل الدخول: عرض فورم الدخول
  return (
    <div style={{ backgroundColor: '#F5F2EC', minHeight: '80vh', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: '450px', width: '100%', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #DAD8D2', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', color: '#20232B' }}>{t.title}</h1>
        <p style={{ color: '#666', marginBottom: '25px', fontSize: '0.95rem' }}>{t.subtitle}</p>

        {errorMsg && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder} 
            style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none', textAlign: isAr ? 'right' : 'left' }} 
          />
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder} 
            style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none', textAlign: isAr ? 'right' : 'left' }} 
          />
          
          <button 
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
          >
            {loading ? t.loggingIn : t.loginBtn}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          {t.noAccount}{' '}
          <Link href="/register" style={{ color: '#2d473b', fontWeight: 'bold', textDecoration: 'none' }}>
            {t.createAccount}
          </Link>
        </p>

      </div>
    </div>
  );
}
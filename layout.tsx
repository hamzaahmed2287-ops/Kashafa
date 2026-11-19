'use client';
import './globals.css';
import './responsive.css';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import SearchBar from '@/components/SearchBar';
import { dict } from '@/utils/dictionary';

const LangContext = createContext<'EN' | 'AR'>('EN');
export const useLang = () => useContext(LangContext);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = dict[lang];

  const [siteSettings, setSiteSettings] = useState({
    supportPhone: '01080967125',
    supportEmail: 'kashafa.eg@gmail.com',
    facebookUrl: '',
    instagramUrl: 'https://www.instagram.com/kashafa.eg',
    tiktokUrl: 'https://www.tiktok.com/@kashafa.eg'
  });

  const pathname = usePathname();
  const isAdminRoute = pathname?.toLowerCase().startsWith('/admin');

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const savedLang = localStorage.getItem('kashafa_lang') as 'EN' | 'AR';
    if (savedLang) setLang(savedLang);

    const loadSiteSettings = () => {
      const savedSettings = localStorage.getItem('kashafa_site_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSiteSettings(prev => ({
            ...prev,
            ...parsed,
            supportPhone: parsed.supportPhone || parsed.whatsapp || parsed.phone || prev.supportPhone
          }));
        } catch (e) {}
      }
    };

    loadSiteSettings();

    const syncLang = () => {
      const updatedLang = localStorage.getItem('kashafa_lang') as 'EN' | 'AR';
      if (updatedLang) setLang(updatedLang);
    };

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('kashafa_cart') || '[]');
      const totalItems = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener('storage', () => {
      updateCartCount();
      loadSiteSettings();
    });
    window.addEventListener('langChanged', syncLang);
    const interval = setInterval(updateCartCount, 400);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('langChanged', syncLang);
      clearInterval(interval);
    };
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'EN' ? 'AR' : 'EN';
    setLang(next);
    localStorage.setItem('kashafa_lang', next);
    window.dispatchEvent(new Event('langChanged'));
  };

  const isAr = lang === 'AR';

  const formatWhatsAppLink = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '2' + cleaned;
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <html lang={lang.toLowerCase()} dir={isAr ? 'rtl' : 'ltr'}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body style={{ backgroundColor: '#F5F2EC', color: '#20232B', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <SessionProviderWrapper>
          <LangContext.Provider value={lang}>
            
            {!isAdminRoute && (
              <>
                {/* الهيدر الأصلي للكمبيوتر */}
                <header className="site-header" style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '14px 40px', backgroundColor: '#F5F2EC', borderBottom: '1px solid #DAD8D2',
                  position: 'sticky', top: 0, zIndex: 1000,
                  direction: 'ltr'
                }}>
                  
                  {/* الشمال: اللوجو */}
                  <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}>
                    <Image src="/logo.png" alt="KASHAFA Logo" width={52} height={52} style={{ objectFit: 'contain' }} priority />
                    <span style={{ fontSize: '1.65rem', fontWeight: '900', letterSpacing: '1.5px', color: '#20232B' }}>
                      KASHAFA
                    </span>
                  </Link>

                  {/* المنتصف: البحث */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
                    <SearchBar />
                  </div>

                  {/* اليمين: الأزرار */}
                  <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    
                    <button onClick={toggleLanguage} style={{
                      backgroundColor: '#FFFFFF', border: '1px solid #DAD8D2', borderRadius: '22px', 
                      padding: '9px 16px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', 
                      color: '#20232B', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 2px 6px rgba(32, 35, 43, 0.05)'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      {isAr ? 'EN' : 'العربية'}
                    </button>

                    <Link 
                      href="/track-order" 
                      className="track-order-link"
                      style={{ 
                        color: '#20232B', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      {isAr ? 'تتبع طلبك' : 'Track Order'}
                    </Link>

                    {/* الشنطة */}
                    <Link href="/cart" title={t.cart} style={{ 
                      textDecoration: 'none', color: '#20232B', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', 
                      border: '1px solid #DAD8D2', backgroundColor: '#FFFFFF', position: 'relative',
                      boxShadow: '0 2px 6px rgba(32, 35, 43, 0.05)'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      
                      {cartCount > 0 && (
                        <span style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          backgroundColor: '#2D473B', color: '#FFFFFF',
                          fontSize: '0.72rem', fontWeight: '800', minWidth: '20px', height: '20px',
                          padding: '0 5px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #F5F2EC'
                        }}>
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    {/* البروفايل */}
                    <Link href="/profile" title={t.profile} style={{ 
                      textDecoration: 'none', backgroundColor: '#20232B', color: '#F5F2EC', 
                      width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(32, 35, 43, 0.15)'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </Link>

                  </div>

                </header>

                {/* زر القائمة المخصصة للموبايل (3 شرط) */}
                <div className="mobile-top-bar" style={{ display: 'none', padding: '10px 16px', backgroundColor: '#F5F2EC', borderBottom: '1px solid #DAD8D2', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ background: '#FFFFFF', border: '1px solid #DAD8D2', borderRadius: '8px', padding: '8px 12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ☰ {isAr ? 'القائمة' : 'Menu'}
                  </button>
                  <Link href="/track-order" style={{ fontWeight: '700', fontSize: '0.9rem', color: '#20232B', textDecoration: 'none' }}>
                    {isAr ? 'تتبع طلبك' : 'Track Order'}
                  </Link>
                </div>

                {/* شريط التنقل العلوي للكمبيوتر */}
                <nav className={`main-nav-bar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ 
                  display: 'flex', justifyContent: 'center', gap: '35px', padding: '14px 0', backgroundColor: '#F5F2EC', borderBottom: '1px solid #DAD8D2', fontWeight: '600', fontSize: '0.95rem',
                  direction: isAr ? 'rtl' : 'ltr'
                }}>
                  <Link href="/" style={{ textDecoration: 'none', color: '#20232B' }}>{t.home}</Link>
                  <Link href="/discoveries" style={{ textDecoration: 'none', color: '#20232B' }}>{t.discoveries}</Link>
                  <Link href="/brands" style={{ textDecoration: 'none', color: '#20232B' }}>{t.brands}</Link>
                  <Link href="/categories" style={{ textDecoration: 'none', color: '#20232B' }}>{t.categories}</Link>
                  <Link href="/offers" style={{ textDecoration: 'none', color: '#20232B' }}>{t.offers}</Link>
                  <Link href="/terms" style={{ textDecoration: 'none', color: '#20232B' }}>{isAr ? 'الشروط والأحكام' : 'Terms'}</Link>
                  <Link href="/about" style={{ textDecoration: 'none', color: '#20232B' }}>{t.about}</Link>
                </nav>
              </>
            )}

            <main>{children}</main>

            {!isAdminRoute && (
              <footer id="about" style={{ 
                backgroundColor: '#161920', color: '#F5F2EC', padding: '60px 40px 30px 40px', 
                borderTop: '1px solid #2D333D', fontFamily: 'system-ui, -apple-system, sans-serif',
                marginTop: '60px', scrollMarginTop: '80px', textAlign: isAr ? 'right' : 'left',
                direction: isAr ? 'rtl' : 'ltr', boxSizing: 'border-box'
              }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '45px', marginBottom: '45px' }}>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Image src="/logo.png" alt="Logo" width={38} height={38} style={{ objectFit: 'contain' }} />
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#A6C96A', margin: 0, letterSpacing: '1px' }}>KASHAFA</h3>
                    </div>
                    <p style={{ color: '#9DA3B0', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
                      {isAr ? 'كشافة هي منصة مصرية رائدة لاكتشاف وتجربة أحدث وأرقى المنتجات الفريدة من أفضل البراندات المحلية بكل سهولة.' : 'KASHAFA is a leading Egyptian platform.'}
                    </p>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '20px', color: '#A6C96A' }}>
                      {isAr ? 'الدعم الفني وتواصل معنا' : 'Support & Contact'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                      {siteSettings.supportEmail && (
                        <a href={`mailto:${siteSettings.supportEmail}`} style={{ color: '#E2E8F0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          {siteSettings.supportEmail}
                        </a>
                      )}
                      {siteSettings.supportPhone && (
                        <a href={formatWhatsAppLink(siteSettings.supportPhone)} target="_blank" rel="noopener noreferrer" style={{ color: '#E2E8F0', textDecoration: 'none', direction: 'ltr', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          <span style={{ direction: 'ltr' }}>{siteSettings.supportPhone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '20px', color: '#A6C96A' }}>
                      {isAr ? 'تابعنا على المنصات' : 'Follow Us'}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {siteSettings.instagramUrl && (
                        <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#232833', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', textDecoration: 'none', transition: 'background 0.2s' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                      )}
                      {siteSettings.tiktokUrl && (
                        <a href={siteSettings.tiktokUrl} target="_blank" rel="noopener noreferrer" title="TikTok" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#232833', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', textDecoration: 'none', transition: 'background 0.2s' }}>
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                        </a>
                      )}
                    </div>
                  </div>

                </div>
                <div style={{ borderTop: '1px solid #2D333D', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
                  <p style={{ margin: 0 }}>KASHAFA — Discover Something New © 2026</p>
                </div>
              </footer>
            )}

          </LangContext.Provider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminLogin from '@/components/admin/AdminLogin';
import ProductsManager from '@/components/admin/ProductsManager';
import BannerManager from '@/components/admin/BannerManager';
import BrandsManager from '@/components/admin/BrandsManager';
import FinancialsManager from '@/components/admin/FinancialsManager';
import OrdersManager from '@/components/admin/OrdersManager';
import ShippingManager from '@/components/admin/ShippingManager';
import AboutManager from '@/components/admin/AboutManager';
import PromoManager from '@/components/admin/PromoManager';
import PaymentSettingsManager from '@/components/admin/PaymentSettingsManager';
import { EGYPT_GOVERNORATES } from '@/utils/egyptData';
import { api } from '@/utils/api'; // 👈 استدعاء ملف الـ API للربط مع قاعدة البيانات

export default function SuperAdminPage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'promo' | 'banner' | 'brands' | 'shipping' | 'financials' | 'terms' | 'settings' | 'about' | 'payment'>('products');
  const [toastMsg, setToastMsg] = useState('');

  const [brands, setBrands] = useState<any[]>([
    { id: '1', slug: 'kashafa-studio', nameEn: 'Kashafa Studio', nameAr: 'استوديو كشافة', commissionRate: 15 }
  ]);

  const [products, setProducts] = useState<any[]>([]);
  const [banner, setBanner] = useState({
    brandNameEn: '',
    brandNameAr: '',
    titleEn: 'Weekly Discovery: Local Egyptian Craft',
    titleAr: 'اكتشاف الأسبوع: إبداعات مصرية محلية',
    subtitleEn: 'Handpicked emerging brands curated just for you.',
    subtitleAr: 'براندات مصرية ناشئة مختارة بعناية خصيصاً لك.',
    story: '',
    videoUrl: '',
    buttonLink: '/discoveries',
    image: '',
    productId1: '',
    productId2: ''
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [governorates, setGovernorates] = useState(EGYPT_GOVERNORATES);
  const [terms, setTerms] = useState({
    ar: 'شروط الاستخدام وسياسة الخصوصية لموقع كشافة...',
    en: 'Terms of Use & Privacy Policy for KASHFA...'
  });

  const [settings, setSettings] = useState({
    supportPhone: '01080967125',
    supportEmail: 'support@kashafa.eg',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com'
  });

  // 👈 جلب البيانات مباشرة من السيرفر وقاعدة بيانات SQL Server بدلاً من الـ localStorage فقط
  useEffect(() => {
    const authStatus = localStorage.getItem('kashafa_admin_logged');
    if (authStatus === 'true') setIsLoggedIn(true);

    const loadAdminDataFromDB = async () => {
      try {
        // 1. جلب المنتجات من الـ API
        const fetchedProducts = await api.getProducts();
        if (fetchedProducts && Array.isArray(fetchedProducts)) {
          setProducts(fetchedProducts);
        }

        // 2. جلب أسعار الشحن من الـ API
        const fetchedShipping = await api.getShippingRates();
        if (fetchedShipping && Array.isArray(fetchedShipping) && fetchedShipping.length > 0) {
          setGovernorates(fetchedShipping);
        }

        // 3. جلب باقي البيانات الإضافية من الـ localStorage كخيار احتياطي أو استمراريتها
        const savedBanner = localStorage.getItem('kashafa_weekly_banner');
        const savedBrands = localStorage.getItem('kashafa_admin_brands');
        const savedOrders = localStorage.getItem('kashafa_admin_orders');
        const savedTerms = localStorage.getItem('kashafa_terms');
        const savedSettings = localStorage.getItem('kashafa_site_settings');

        if (savedBanner) setBanner(JSON.parse(savedBanner));
        if (savedBrands) setBrands(JSON.parse(savedBrands));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedTerms) setTerms(JSON.parse(savedTerms));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error('Error loading admin data from server:', err);
      }
    };

    loadAdminDataFromDB();
    window.addEventListener('storage', loadAdminDataFromDB);
    return () => window.removeEventListener('storage', loadAdminDataFromDB);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('kashafa_admin_logged');
    setIsLoggedIn(false);
  };

  const handleSaveTerms = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kashafa_terms', JSON.stringify(terms));
    window.dispatchEvent(new Event('storage'));
    showToast(isAr ? '✓ تم حفظ الشروط وسياسة الاستخدام بنجاح!' : '✓ Terms saved successfully!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kashafa_site_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('storage'));
    showToast(isAr ? '✓ تم حفظ إعدادات الدعم والسوشيال ميديا بنجاح!' : '✓ Settings saved successfully!');
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kashafa_weekly_banner', JSON.stringify(banner));
    showToast(isAr ? '✓ تم حفظ وتحديث البانر الأسبوعي بنجاح!' : '✓ Weekly banner saved successfully!');
  };

  // 👈 دالة حفظ المنتجات مع إرسالها للباك اند وقاعدة البيانات الحقيقية
  const handleSaveProducts = async (up: any[]) => {
    setProducts(up);
    try {
      // حفظ المنتج الجديد عبر الـ API في الداتا بيز
      const latestProduct = up[0]; // المنتج المضاف حديثاً في البداية
      if (latestProduct) {
        await api.createProduct(latestProduct);
      }
      
      const lightweightProducts = up.map((p: any) => ({
        id: p.id,
        title: p.title,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        price: p.price,
        image: p.image || p.images?.[0] || '',
        images: p.images,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        isDiscovery: p.isDiscovery,
        isOffer: p.isOffer
      }));
      localStorage.setItem('kashafa_products', JSON.stringify(lightweightProducts));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving product to database:', error);
      alert(isAr ? '⚠️ حدث خطأ أثناء الحفظ في قاعدة البيانات.' : '⚠️ Error saving to database.');
    }
  };

  const t = {
    panelTitle: isAr ? 'لوحة تحكم السوبر أدمن' : 'Super Admin Dashboard',
    panelSubtitle: isAr ? 'إدارة المنتجات، الطلبات، الخصومات، الشحن، الشروط، والدعم وأرقام الدفع.' : 'Manage products, orders, promo codes, shipping, terms, payment numbers & support.',
    tabs: {
      products: isAr ? 'المنتجات والمخزون' : 'Products & Stock',
      orders: isAr ? 'طلبات العملاء والإيصالات' : 'Orders & Receipts',
      promo: isAr ? 'أكواد الخصم (Promo)' : 'Promo Codes',
      banner: isAr ? 'البانر الأسبوعي' : 'Weekly Banner',
      brands: isAr ? 'البراندات والعمولة' : 'Brands & Commissions',
      shipping: isAr ? 'الشحن ومدة التوصيل' : 'Shipping & Delivery',
      financials: isAr ? 'الماليات والتحصيل' : 'Financials & Payouts',
      payment: isAr ? 'أرقام الدفع (فودافون/إنستا)' : 'Payment Numbers',
      terms: isAr ? 'الشروط وسياسة الاستخدام' : 'Terms & Policies',
      settings: isAr ? 'الدعم والسوشيال ميديا' : 'Support & Social',
      about: isAr ? 'إدارة صفحة (من نحن)' : 'About Us'
    }
  };

  return (
    <div style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AdminHeader isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      {!isLoggedIn ? (
        <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <div style={{ padding: '40px 20px', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left', color: '#20232B' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '8px' }}>{t.panelTitle}</h1>
              <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>{t.panelSubtitle}</p>
            </div>

            {toastMsg && (
              <div style={{ backgroundColor: '#2D473B', color: '#F5F2EC', padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', fontWeight: '700' }}>
                {toastMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }} className="admin-tabs-bar">
              {[
                { id: 'products', label: t.tabs.products },
                { id: 'orders', label: t.tabs.orders },
                { id: 'promo', label: t.tabs.promo },
                { id: 'shipping', label: t.tabs.shipping },
                { id: 'banner', label: t.tabs.banner },
                { id: 'brands', label: t.tabs.brands },
                { id: 'financials', label: t.tabs.financials },
                { id: 'payment', label: t.tabs.payment },
                { id: 'terms', label: t.tabs.terms },
                { id: 'settings', label: t.tabs.settings },
                { id: 'about', label: t.tabs.about }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: activeTab === tab.id ? 'none' : '1px solid #DAD8D2',
                    backgroundColor: activeTab === tab.id ? '#20232B' : '#FFFFFF',
                    color: activeTab === tab.id ? '#F5F2EC' : '#20232B',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'products' && (
              <ProductsManager isAr={isAr} products={products} brands={brands} onSaveProducts={handleSaveProducts} showToast={showToast} />
            )}
            {activeTab === 'orders' && (
              <OrdersManager isAr={isAr} orders={orders} onSaveOrders={(up) => { setOrders(up); localStorage.setItem('kashafa_admin_orders', JSON.stringify(up)); }} showToast={showToast} />
            )}
            {activeTab === 'promo' && (
              <PromoManager isAr={isAr} showToast={showToast} />
            )}
            {activeTab === 'banner' && (
              <BannerManager 
                isAr={isAr} 
                banner={banner} 
                setBanner={setBanner} 
                onSaveBanner={handleSaveBanner}
                brands={brands}
                products={products}
              />
            )}
            {activeTab === 'brands' && (
              <BrandsManager isAr={isAr} brands={brands} onSaveBrands={(up) => { setBrands(up); localStorage.setItem('kashafa_admin_brands', JSON.stringify(up)); }} showToast={showToast} />
            )}
            {activeTab === 'shipping' && (
              <ShippingManager isAr={isAr} governorates={governorates} onSaveGovernorates={(up) => { setGovernorates(up); localStorage.setItem('kashafa_shipping_rates', JSON.stringify(up)); }} showToast={showToast} />
            )}
            {activeTab === 'financials' && (
              <FinancialsManager isAr={isAr} brands={brands} orders={orders} onSaveOrders={(up) => { setOrders(up); localStorage.setItem('kashafa_admin_orders', JSON.stringify(up)); }} showToast={showToast} />
            )}
            {activeTab === 'payment' && (
              <PaymentSettingsManager isAr={isAr} showToast={showToast} />
            )}
            {activeTab === 'terms' && (
              <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
                  {isAr ? 'تعديل صفحة الشروط وسياسة الاستخدام' : 'Edit Terms & Privacy Policy'}
                </h2>
                <form onSubmit={handleSaveTerms} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'النص بالعربية:' : 'Arabic Text:'}</label>
                    <textarea rows={6} value={terms.ar} onChange={(e) => setTerms({ ...terms, ar: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'النص بالإنجليزية:' : 'English Text:'}</label>
                    <textarea rows={6} value={terms.en} onChange={(e) => setTerms({ ...terms, en: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: '900', cursor: 'pointer', width: 'fit-content' }}>
                    {isAr ? 'حفظ الشروط' : 'Save Terms'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'settings' && (
              <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
                  {isAr ? 'إعدادات الدعم الفني وروابط السوشيال ميديا' : 'Support & Social Media Settings'}
                </h2>
                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'رقم هاتف الدعم الفني:' : 'Support Phone:'}</label>
                      <input type="text" value={settings.supportPhone} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'ايميل الدعم الفني:' : 'Support Email:'}</label>
                      <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'رابط صفحة فيسبوك:' : 'Facebook URL:'}</label>
                    <input type="text" value={settings.facebookUrl} onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'رابط حساب انستجرام:' : 'Instagram URL:'}</label>
                    <input type="text" value={settings.instagramUrl} onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'رابط حساب تيك توك:' : 'TikTok URL:'}</label>
                    <input type="text" value={settings.tiktokUrl} onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: '900', cursor: 'pointer', width: 'fit-content', marginTop: '10px' }}>
                    {isAr ? 'حفظ إعدادات السوشيال والدعم 🚀' : 'Save Settings 🚀'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'about' && (
              <AboutManager isAr={isAr} showToast={showToast} />
            )}

          </div>
        </div>
      )}
    </div>
  );
}
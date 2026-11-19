'use client';
import { useLang } from '@/app/layout';
import { dict } from '@/utils/dictionary';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

export default function BrandsPage() {
  const lang = useLang();
  const t = dict[lang];
  const isAr = lang === 'AR';

  const [brandsList, setBrandsList] = useState<any[]>([]);

  const loadBrands = async () => {
    let fetchedBrands = [];

    // 1. محاولة الجلب من الـ API (قاعدة البيانات الأساسية للكمبيوتر والموبايل)
    try {
      const dbBrands = await (api as any).getBrands?.();
      if (Array.isArray(dbBrands) && dbBrands.length > 0) {
        fetchedBrands = dbBrands;
        // تحديث النسخة المحلية للموبايل
        localStorage.setItem('kashafa_admin_brands', JSON.stringify(dbBrands));
      }
    } catch (err) {
      console.warn('API getBrands failed, checking local fallback');
    }

    // 2. لو الـ API مقفول، نجرب التخزين المحلي
    if (fetchedBrands.length === 0) {
      const localBrands = localStorage.getItem('kashafa_admin_brands');
      if (localBrands) {
        try {
          const parsed = JSON.parse(localBrands);
          if (Array.isArray(parsed) && parsed.length > 0) {
            fetchedBrands = parsed;
          }
        } catch (e) {}
      }
    }

    // تعيين البراندات الحقيقية فقط (تم إزالة البراند الوهمي نهائياً)
    setBrandsList(fetchedBrands);
  };

  useEffect(() => {
    loadBrands();

    const handleStorageChange = () => {
      loadBrands();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [t]);

  return (
    <div className="brands-page-container" style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', color: '#20232B', fontFamily: 'system-ui, sans-serif', padding: '40px 20px', direction: isAr ? 'rtl' : 'ltr', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px' }}>{t.brandsTitle || (isAr ? 'البراندات' : 'Brands')}</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '1rem' }}>{t.brandsDesc || (isAr ? 'استكشف أفضل البراندات المحلية معنا.' : 'Explore top local brands with us.')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', boxSizing: 'border-box' }}>
          {brandsList.length > 0 ? (
            brandsList.map((brand) => {
              const bNameEn = brand.nameEn || brand.NameEn || '';
              const bNameAr = brand.nameAr || brand.NameAr || '';
              const brandName = isAr ? (bNameAr || bNameEn) : (bNameEn || bNameAr);
              const brandSlug = brand.slug || brand.Slug || bNameEn.toLowerCase().replace(/\s+/g, '-');
              const brandDesc = brand.description || brand.descriptionEn || brand.descriptionAr || (isAr ? 'اكتشف أرقى المنتجات الحصرية من هذا البراند.' : 'Explore exclusive products from this brand.');
              const brandLogo = brand.logo || brand.LogoUrl || '';
              const brandInitial = (bNameEn || 'K').charAt(0).toUpperCase();

              return (
                <div 
                  key={brand.id || brand.Id || brandSlug} 
                  style={{ 
                    backgroundColor: '#FFFFFF', border: '1px solid #DAD8D2', borderRadius: '18px', 
                    padding: '24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(32, 35, 43, 0.03)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <div>
                    <div style={{ 
                      width: '75px', height: '75px', backgroundColor: '#F5F2EC', borderRadius: '50%', 
                      margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 'bold', fontSize: '1.2rem', color: '#20232B', overflow: 'hidden', border: '2px solid #E2DCCB',
                      flexShrink: 0
                    }}>
                      {brandLogo ? (
                        <img src={brandLogo} alt={brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>{brandInitial}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px', wordBreak: 'break-word' }}>{brandName}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', wordBreak: 'break-word' }}>{brandDesc}</p>
                  </div>

                  <Link 
                    href={`/brands/${brandSlug}`} 
                    style={{ 
                      display: 'inline-block', backgroundColor: '#20232B', color: '#F5F2EC', 
                      padding: '10px 20px', borderRadius: '25px', textDecoration: 'none', 
                      fontSize: '0.9rem', fontWeight: 'bold' 
                    }}
                  >
                    {t.exploreProducts || (isAr ? 'استعرض المنتجات' : 'Explore Products')}
                  </Link>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#FFF', borderRadius: '16px', color: '#666' }}>
              {isAr ? 'لا توجد براندات متاحة حالياً.' : 'No brands available currently.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
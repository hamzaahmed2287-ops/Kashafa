'use client';
import { useState, useEffect } from 'react';
import WeeklyBrandBanner from '@/components/WeeklyBrandBanner';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { useLang } from './layout';
import { api } from '@/utils/api';

export default function Home() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const formatProduct = (p: any) => ({
      id: p.id,
      title: typeof p.title === 'object' ? p.title : { EN: p.nameEn || p.name || p.title || 'Product', AR: p.nameAr || p.name || p.title || 'منتج' },
      price: String(p.price).includes('EGP') ? p.price : `${p.price} EGP`,
      rating: p.rating || 5.0,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'],
      category: typeof p.category === 'object' ? p.category : { EN: p.category || 'New', AR: p.categoryAr || p.category || 'جديد' }
    });

    async function syncProducts() {
      let dbProducts: any[] = [];
      try {
        const fetched = await api.getProducts();
        if (Array.isArray(fetched) && fetched.length > 0) {
          dbProducts = fetched.map(formatProduct);
        }
      } catch (e) {
        console.warn('Failed to fetch from DB');
      }

      const localStored = JSON.parse(
        localStorage.getItem('kashafa_admin_products') || 
        localStorage.getItem('kashafa_products') || '[]'
      );
      const formattedLocal = Array.isArray(localStored) ? localStored.map(formatProduct) : [];

      const combinedMap = new Map();
      [...formattedLocal, ...dbProducts].forEach(p => {
        combinedMap.set(p.id, p);
      });

      setFeaturedProducts(Array.from(combinedMap.values()));
    }

    syncProducts();
    window.addEventListener('storage', syncProducts);
    return () => window.removeEventListener('storage', syncProducts);
  }, []);

  const categoriesList = [
    { href: '/categories/fashion', labelAr: 'أزياء', labelEn: 'Fashion', icon: <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path> },
    { href: '/categories/beauty', labelAr: 'جمال وعناية', labelEn: 'Beauty & Care', icon: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path> },
    { href: '/categories/accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories', icon: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18m-5 4a4 4 0 0 1-8 0"></path> },
    { href: '/categories/pets', labelAr: 'منتجات الحيوانات', labelEn: 'Pet Supplies', icon: <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path> },
    { href: '/categories/home-living', labelAr: 'حاجات البيت', labelEn: 'Home & Living', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"></path> },
    { href: '/categories/electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics', icon: <path d="M2 3h20v14H2zM8 21h8m-4-4v4"></path> },
    { href: '/categories/sports', labelAr: 'أدوات رياضية', labelEn: 'Sports', icon: <circle cx="12" cy="12" r="10"></circle> }
  ];

  return (
    <div style={{ backgroundColor: '#F5F2EC', color: '#20232B', fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* 1. بانر براند الأسبوع (متجاوب) */}
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
        <WeeklyBrandBanner />
      </div>

      {/* 2. الأقسام (تم ضبطها لتصبح شبكية متجاوبة على الكمبيوتر وأفقي سلس على الموبايل) */}
      <section style={{ padding: '20px 16px', maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '12px', 
          boxSizing: 'border-box' 
        }}>
          {categoriesList.map((cat, idx) => (
            <Link key={idx} href={cat.href} style={{ textDecoration: 'none', width: '100%' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DAD8D2', borderRadius: '16px', padding: '16px 10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(32, 35, 43, 0.03)', boxSizing: 'border-box' }}>
                <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#F5F2EC', borderRadius: '50%', marginBottom: '8px', color: '#20232B' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{cat.icon}</svg>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#20232B' }}>{isAr ? cat.labelAr : cat.labelEn}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. شبكة المنتجات المميزة */}
      <section style={{ padding: '10px 16px 40px 16px', maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#20232B', margin: 0 }}>
            {isAr ? '🔥 منتجات مميزة لاكتشافها' : '🔥 Featured Discoveries'}
          </h2>
        </div>

        {featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #DAD8D2', color: '#666', fontSize: '0.9rem' }}>
            {isAr ? 'جاري تحميل المنتجات...' : 'Loading products...'}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '16px', 
            boxSizing: 'border-box' 
          }}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
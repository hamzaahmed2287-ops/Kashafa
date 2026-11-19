'use client';
import { useLang } from '@/app/layout';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function DiscoveriesPage() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const [discoveryProducts, setDiscoveryProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadDiscoveries = async () => {
      try {
        // 1. جلب المنتجات من قاعدة البيانات عبر الـ API
        const dbProducts = await api.getProducts();
        
        // 2. خيار احتياطي من الـ LocalStorage في حال عدم توفر الاتصال
        const localProducts = JSON.parse(
          localStorage.getItem('kashafa_admin_products') || 
          localStorage.getItem('kashafa_products') || '[]'
        );

        const allProducts = (dbProducts && dbProducts.length > 0) ? dbProducts : localProducts;

        // تصفية المنتجات التي تم اختيارها لتكون ضمن الاكتشافات (isDiscovery)
        const discoveries = allProducts.filter((p: any) => p.isDiscovery === true || p.IsDiscovery === true);
        setDiscoveryProducts(discoveries);
      } catch (err) {
        console.error('Error loading discoveries:', err);
      }
    };

    loadDiscoveries();
    window.addEventListener('storage', loadDiscoveries);
    return () => window.removeEventListener('storage', loadDiscoveries);
  }, []);

  const content = {
    EN: {
      title: "✦ New Discoveries",
      desc: "The latest innovative products from emerging Egyptian brands.",
      comingSoon: "New discoveries will be showcased here very soon!"
    },
    AR: {
      title: "✦ اكتشافات جديدة",
      desc: "أحدث المنتجات المبتكرة من البراندات المصرية الناشئة.",
      comingSoon: "قريباً جداً سيتم عرض أحدث الاكتشافات هنا!"
    }
  };

  const t = content[lang];

  return (
    <div style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', padding: '40px 60px', fontFamily: 'system-ui, sans-serif', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: '#20232B', textAlign: isAr ? 'right' : 'left' }}>{t.title}</h1>
        <p style={{ color: '#666', marginBottom: '35px', textAlign: isAr ? 'right' : 'left' }}>{t.desc}</p>
        
        {discoveryProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {discoveryProducts.map((product) => {
              const pId = product.id || product.Id;
              const formattedTitle = {
                EN: product.nameEn || product.NameEn || product.title?.EN || product.title || 'Product',
                AR: product.nameAr || product.NameAr || product.title?.AR || product.title || 'منتج'
              };
              const catVal = product.category || product.Category;
              const formattedCategory = {
                EN: typeof catVal === 'object' ? catVal.EN : (catVal || 'Discovery'),
                AR: typeof catVal === 'object' ? catVal.AR : (catVal || 'اكتشاف')
              };
              const imgVal = product.image || product.Image;
              const images = product.images?.length > 0 ? product.images : (imgVal ? [imgVal] : []);
              const pPrice = product.price ?? product.Price ?? 0;
              const pStock = product.stock ?? product.Stock ?? 10;

              return (
                <ProductCard 
                  key={pId}
                  id={pId}
                  title={formattedTitle}
                  price={`${pPrice} ${isAr ? 'ج.م' : 'EGP'}`}
                  images={images}
                  category={formattedCategory}
                  stock={pStock}
                  sizes={product.sizes || []}
                  colors={product.colors || []}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', padding: '50px', borderRadius: '18px', border: '1px solid #DAD8D2', textAlign: 'center', color: '#666', boxShadow: '0 2px 8px rgba(32, 35, 43, 0.03)' }}>
            {t.comingSoon}
          </div>
        )}
      </div>
    </div>
  );
}
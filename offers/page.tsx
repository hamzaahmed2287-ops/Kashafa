'use client';
import { useLang } from '@/app/layout';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function OffersPage() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const [offerProducts, setOfferProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // 1. جلب المنتجات من قاعدة البيانات عبر الـ API
        const dbProducts = await api.getProducts();
        
        // 2. خيار احتياطي من الـ LocalStorage في حال عدم توفر الاتصال
        const localProducts = JSON.parse(
          localStorage.getItem('kashafa_admin_products') || 
          localStorage.getItem('kashafa_products') || '[]'
        );

        const allProducts = (dbProducts && dbProducts.length > 0) ? dbProducts : localProducts;

        // تصفية المنتجات التي تم اختيارها لتكون ضمن العروض (isOffer)
        const offers = allProducts.filter((p: any) => p.isOffer === true || p.IsOffer === true);
        setOfferProducts(offers);
      } catch (err) {
        console.error('Error loading offers:', err);
      }
    };

    loadOffers();
    window.addEventListener('storage', loadOffers);
    return () => window.removeEventListener('storage', loadOffers);
  }, []);

  const content = {
    EN: {
      title: "🔥 Special Offers",
      desc: "Exclusive limited-time discounts on Kashafa products.",
      noOffers: "No active offers right now, stay tuned!"
    },
    AR: {
      title: "🔥 عروض خاصة",
      desc: "خصومات حصرية لفترة محدودة على منتجات كشافة.",
      noOffers: "لا توجد عروض نشطة حالياً، ترقبونا قريباً!"
    }
  };

  const t = content[lang];

  return (
    <div style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', padding: '40px 60px', fontFamily: 'system-ui, sans-serif', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: '#20232B', textAlign: isAr ? 'right' : 'left' }}>{t.title}</h1>
        <p style={{ color: '#666', marginBottom: '35px', textAlign: isAr ? 'right' : 'left' }}>{t.desc}</p>
        
        {offerProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {offerProducts.map((product) => {
              const pId = product.id || product.Id;
              const formattedTitle = {
                EN: product.nameEn || product.NameEn || product.title?.EN || product.title || 'Product',
                AR: product.nameAr || product.NameAr || product.title?.AR || product.title || 'منتج'
              };
              const catVal = product.category || product.Category;
              const formattedCategory = {
                EN: typeof catVal === 'object' ? catVal.EN : (catVal || 'Offer'),
                AR: typeof catVal === 'object' ? catVal.AR : (catVal || 'عرض خاص')
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
            {t.noOffers}
          </div>
        )}
      </div>
    </div>
  );
}
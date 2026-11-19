'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/app/layout';

export default function CartPage() {
  const lang = useLang();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('kashafa_cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const handleRemove = (id: any, selectedSize?: string, selectedColor?: string) => {
    const updated = cartItems.filter(item => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor));
    setCartItems(updated);
    localStorage.setItem('kashafa_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateQuantity = (id: any, selectedSize: string, selectedColor: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('kashafa_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const numPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      return sum + (numPrice * (item.quantity || 1));
    }, 0);
  };

  const total = calculateTotal();
  const shipping = cartItems.length > 0 ? 50 : 0;
  const isAr = lang === 'AR';

  return (
    <div style={{ padding: '20px 14px 40px', maxWidth: '1200px', margin: '0 auto', direction: isAr ? 'rtl' : 'ltr' }}
         className="cart-container">
      <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px', color: '#20232B' }}>
        {isAr ? '🛍️ شنطة المشتريات' : '🛍️ Shopping Bag'}
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #DAD8D2' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>
            {isAr ? 'شنطة المشتريات فارغة حالياً!' : 'Your shopping bag is currently empty!'}
          </p>
          <Link href="/" style={{ backgroundColor: '#A6C96A', color: '#20232B', padding: '12px 24px', borderRadius: '25px', textDecoration: 'none', fontWeight: '700' }}>
            {isAr ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #DAD8D2', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={item.image} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 4px 0', color: '#20232B' }}>
                      {typeof item.title === 'object' ? (isAr ? item.title.AR : item.title.EN) : item.title}
                    </h3>
                    
                    {/* 👈 عرض المقاس واللون المختار بوضوح */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '4px 0' }}>
                      {item.selectedSize && (
                        <span style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: '800' }}>
                          {isAr ? 'المقاس:' : 'Size:'} {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span style={{ fontSize: '0.85rem', color: '#2D473B', fontWeight: '800' }}>
                          {isAr ? 'اللون:' : 'Color:'} {item.selectedColor}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#2D473B', fontWeight: '800', margin: '4px 0 8px 0' }}>{item.price}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #DAD8D2', backgroundColor: '#F5F2EC', cursor: 'pointer', fontWeight: 'bold' }}
                      >-</button>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.quantity || 1}</span>
                      <button 
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #DAD8D2', backgroundColor: '#F5F2EC', cursor: 'pointer', fontWeight: 'bold' }}
                      >+</button>
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => handleRemove(item.id, item.selectedSize, item.selectedColor)}
                  style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                >
                  {isAr ? 'حذف' : 'Remove'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #DAD8D2' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#20232B' }}>
              {isAr ? 'ملخص الطلب' : 'Order Summary'}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
              <span>{isAr ? 'إجمالي المنتجات' : 'Subtotal'}</span>
              <span style={{ fontWeight: '700' }}>{total} EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem' }}>
              <span>{isAr ? 'مصاريف الشحن' : 'Shipping'}</span>
              <span style={{ fontWeight: '700' }}>{shipping} EGP</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #DAD8D2', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.1rem', fontWeight: '900', color: '#2D473B' }}>
              <span>{isAr ? 'الإجمالي الكلي' : 'Total'}</span>
              <span>{total + shipping} EGP</span>
            </div>
            <Link href="/checkout" style={{ display: 'block', textAlign: 'center', backgroundColor: '#20232B', color: '#F5F2EC', padding: '14px', borderRadius: '30px', textDecoration: 'none', fontWeight: '800' }}>
              {isAr ? 'إتمام الطلب السريع 🚀' : 'Proceed to Checkout 🚀'}
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
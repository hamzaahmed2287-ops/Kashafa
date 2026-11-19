'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';
import Link from 'next/link';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API

export default function TermsPage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [termsText, setTermsText] = useState({
    ar: 'شروط الاستخدام وسياسة الخصوصية لموقع كشافة...',
    en: 'Terms of Use & Privacy Policy for KASHFA...'
  });

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        // محاولة جلب الشروط من الباك إند أو الـ API لو متاح
        const res = await fetch('http://localhost:5000/api/settings/terms');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setTermsText(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to localStorage for terms');
      }

      // الخيار الاحتياطي المحلي
      const savedTerms = localStorage.getItem('kashafa_terms');
      if (savedTerms) {
        try {
          setTermsText(JSON.parse(savedTerms));
        } catch (e) {}
      }
    };

    fetchTerms();
  }, []);

  return (
    <div style={{ padding: '50px 20px', maxWidth: '900px', margin: '0 auto', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #DAD8D2', boxShadow: '0 4px 20px rgba(32,35,43,0.04)' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#20232B', marginBottom: '24px' }}>
          {isAr ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms & Privacy Policy'}
        </h1>

        <div style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '30px', whiteSpace: 'pre-line' }}>
          {isAr ? termsText.ar : termsText.en}
        </div>

        <Link 
          href="/" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#20232B', 
            color: '#F5F2EC', 
            padding: '12px 28px', 
            borderRadius: '25px', 
            textDecoration: 'none', 
            fontWeight: '800',
            fontSize: '0.95rem'
          }}
        >
          {isAr ? 'العودة إلى الرئيسية 🏠' : 'Back to Home 🏠'}
        </Link>

      </div>
    </div>
  );
}
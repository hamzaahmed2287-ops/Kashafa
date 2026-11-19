'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [about, setAbout] = useState({
    titleAr: 'من نحن - كشافة',
    titleEn: 'About Us - KASHAFA',
    descAr: 'كشافة هي منصة مصرية رائدة تم تصميمها خصيصاً لتسهيل تجربة تسوق واكتشاف أرقى المنتجات...',
    descEn: 'KASHAFA is a leading Egyptian platform designed to facilitate the shopping and discovery experience...'
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // 1. محاولة جلب محتوى "من نحن" من الباك إند أو قاعدة البيانات عبر الـ API
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/settings/about`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setAbout(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to localStorage for about page');
      }

      // 2. الخيار الاحتياطي المحلي في حال عدم توفر السيرفر
      const saved = localStorage.getItem('kashafa_about');
      if (saved) {
        try {
          setAbout(JSON.parse(saved));
        } catch (e) {}
      }
    };

    fetchAboutData();
  }, []);

  return (
    <div style={{ padding: '50px 20px', maxWidth: '900px', margin: '0 auto', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #DAD8D2', boxShadow: '0 4px 20px rgba(32,35,43,0.04)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Image src="/logo.png" alt="Logo" width={56} height={56} style={{ objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#20232B', margin: 0 }}>
              {isAr ? about.titleAr : about.titleEn}
            </h1>
          </div>
        </div>

        <p style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '30px', whiteSpace: 'pre-line' }}>
          {isAr ? about.descAr : about.descEn}
        </p>

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
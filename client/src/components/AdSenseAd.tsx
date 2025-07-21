import { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export function AdSenseAd({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block' },
  className = '',
  responsive = true 
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Check if adsbygoogle is available and push the ad
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXX" // Replace with your actual AdSense client ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

// Banner Ad Component (728x90 or responsive)
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseAd
      adSlot="1234567890" // Replace with your actual ad slot ID
      adFormat="auto"
      className={`banner-ad ${className}`}
      adStyle={{ display: 'block', width: '100%', height: '90px' }}
    />
  );
}

// Square Ad Component (300x250)
export function SquareAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseAd
      adSlot="1234567891" // Replace with your actual ad slot ID
      adFormat="rectangle"
      className={`square-ad ${className}`}
      adStyle={{ display: 'inline-block', width: '300px', height: '250px' }}
    />
  );
}

// Sidebar Ad Component (160x600)
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseAd
      adSlot="1234567892" // Replace with your actual ad slot ID
      adFormat="vertical"
      className={`sidebar-ad ${className}`}
      adStyle={{ display: 'inline-block', width: '160px', height: '600px' }}
    />
  );
}

// Mobile Banner Ad Component (320x50)
export function MobileBannerAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseAd
      adSlot="1234567893" // Replace with your actual ad slot ID
      adFormat="auto"
      className={`mobile-banner-ad ${className}`}
      adStyle={{ display: 'block', width: '100%', height: '50px' }}
    />
  );
}
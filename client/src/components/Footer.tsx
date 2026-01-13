import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContactForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    
    if (currentPath === '/help') {
      // Already on help page, just scroll to the element
      const element = document.getElementById('contact-support');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to help page, then scroll after page loads
      window.location.href = '/help#contact-support';
    }
  };

  return (
    <footer className="bg-black/50 border-t border-orange-500/20 mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-cinzel text-lg font-semibold text-orange-500">
              The Paint Forge
            </h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive miniature paint inventory management and showcase platform for serious painters.
            </p>
            <p className="text-xs text-muted-foreground">
              Free service helping painters avoid duplicate purchases and manage their collections effectively.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/inventory" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                Paint Database
              </Link>
              <Link href="/projects" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                Miniature Showcase
              </Link>
              <Link href="/help" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                Help Center
              </Link>
              <Link href="/profile" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                User Profile
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Resources</h4>
            <div className="space-y-2 text-sm">
              <Link href="/privacy-policy" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy-policy" onClick={scrollToTop} className="block text-muted-foreground hover:text-orange-500 transition-colors">
                Cookie Policy
              </Link>
              <a href="/help#contact-support" onClick={navigateToContactForm} className="block text-muted-foreground hover:text-orange-500 transition-colors cursor-pointer">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-orange-500/20 pt-6">
          {/* Trademark Disclosures */}
          <div className="mb-6 text-xs text-muted-foreground leading-relaxed">
            <h5 className="font-semibold text-white mb-2">Trademark Acknowledgments</h5>
            <p className="mb-2">
              <strong>Games Workshop®</strong> and <strong>Citadel®</strong> are registered trademarks of Games Workshop Limited. 
              <strong>Warhammer 40,000®</strong>, <strong>Age of Sigmar®</strong>, and all associated marks, names, races, vehicles, 
              weapons, characters, and the distinctive likeness thereof are either ® or ™ of Games Workshop Limited.
            </p>
            <p className="mb-2">
              <strong>The Army Painter®</strong> is a registered trademark of The Army Painter ApS. 
              <strong>Vallejo®</strong> is a registered trademark of Acrylicos Vallejo, S.A. 
              <strong>Reaper®</strong> is a registered trademark of Reaper Miniatures, Inc.
            </p>
            <p className="mb-2">
              <strong>Scale75®</strong> is a registered trademark of Scale75. 
            </p>
            <p className="mb-2">
              <strong>Two Thin Coats®</strong> is a registered trademark of Duncan Rhodes Painting Academy.
            </p>
            <p>
              All other trademarks are the property of their respective owners. Paint color information is provided for 
              reference purposes only and may not represent exact color matches due to monitor variations and paint formulations.
            </p>
          </div>

          {/* Legal Disclaimers */}
          <div className="mb-6 text-xs text-muted-foreground">
            <h5 className="font-semibold text-white mb-2">Important Disclaimers</h5>
            <div className="space-y-2">
              <p>
                <strong>Independent Service:</strong> The Paint Forge is an independent fan-created tool and is not affiliated with, 
                endorsed by, or sponsored by any of the paint manufacturers or game companies mentioned.
              </p>
              <p>
                <strong>Color Accuracy:</strong> Paint colors displayed may vary from actual paint colors due to monitor settings, 
                lighting conditions, and manufacturing variations. Always verify colors in person when possible.
              </p>
              <p>
                <strong>Product Information:</strong> Paint specifications, availability, and product codes are subject to change 
                by manufacturers without notice. Users should verify current product information with official retailers.
              </p>
              <p>
                <strong>User Content:</strong> Users retain ownership of their uploaded content but grant The Paint Forge 
                non-exclusive rights to display and share user-generated content within the platform.
              </p>
              <p>
                <strong>Data Accuracy:</strong> While we strive for accuracy in our paint database, information is provided 
                "as is" without warranty. Users should verify critical information independently.
              </p>
            </div>
          </div>

          {/* Copyright and Final Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-orange-500/10">
            <div className="text-xs text-muted-foreground mb-4 md:mb-0">
              © {currentYear} The Paint Forge. All rights reserved.
            </div>
            <div className="text-xs text-muted-foreground">
              <span>Built for the miniature painting community</span>
            </div>
          </div>

          {/* Additional Legal Notice */}
          <div className="mt-4 pt-4 border-t border-orange-500/10 text-center">
            <p className="text-xs text-muted-foreground">
              This website uses cookies to enhance user experience and provide personalized content. 
              By continuing to use this site, you agree to our use of cookies as described in our Cookie Policy.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

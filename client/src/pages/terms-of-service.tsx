import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-orange-500 gothic-shadow mb-2">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            By accessing and using The Paint Forge, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Service Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Paint Forge is a free web-based tool for managing miniature paint collections and showcasing 
            painted miniatures. Our service includes:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Access to a comprehensive database of 1,185+ verified paint entries</li>
            <li>• Personal inventory tracking to avoid duplicate purchases</li>
            <li>• Project showcase and documentation tools</li>
            <li>• Cross-device synchronization of user data</li>
            <li>• Sharing capabilities for completed projects</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>User Accounts and Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Account Creation</h3>
            <p className="text-muted-foreground">
              You must provide accurate information when creating an account and maintain the security 
              of your login credentials.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">User Content</h3>
            <p className="text-muted-foreground">
              You retain ownership of content you upload but grant us rights to display and share it 
              within our platform. You are responsible for ensuring your content does not violate 
              copyright or other legal rights.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Prohibited Uses</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Uploading offensive, illegal, or inappropriate content</li>
              <li>• Attempting to breach security or access unauthorized areas</li>
              <li>• Using automated tools to scrape or download database content</li>
              <li>• Impersonating other users or providing false information</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Image Content Policy</h3>
            <p className="text-muted-foreground mb-2">
              The Paint Forge is intended for showcasing miniature painting projects. All uploaded images must comply with the following requirements:
            </p>
            <ul className="space-y-1 text-muted-foreground mb-3">
              <li>• Images must be related to miniature painting, hobby projects, or paint collections</li>
              <li>• No nudity, sexual content, or adult material of any kind</li>
              <li>• No violent, disturbing, or graphic imagery</li>
              <li>• No hate speech, discriminatory symbols, or offensive content</li>
              <li>• No illegal content including but not limited to: child exploitation, terrorism, drug use, or violence</li>
              <li>• No copyrighted material without proper authorization</li>
              <li>• No spam, advertising, or commercial content unrelated to miniature painting</li>
            </ul>
            <p className="text-red-400 font-medium">
              WARNING: Violation of this image policy will result in immediate account termination without warning. 
              Illegal content will be reported to appropriate law enforcement authorities and may result in criminal prosecution.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Trademark Acknowledgments</h3>
            <p className="text-muted-foreground">
              All paint brand names, product names, and trademarks mentioned are property of their 
              respective owners. We are not affiliated with any paint manufacturers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Our Content</h3>
            <p className="text-muted-foreground">
              The Paint Forge platform, database structure, and compiled paint information are our 
              intellectual property, though individual paint specifications remain property of manufacturers.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Disclaimers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Service Availability</h3>
            <p className="text-muted-foreground">
              We provide our service "as is" without warranties. We do not guarantee uninterrupted 
              access or that the service will be error-free.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Color Accuracy</h3>
            <p className="text-muted-foreground">
              Paint colors displayed may vary from actual colors due to monitor differences and 
              manufacturing variations. Always verify colors before purchasing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Product Information</h3>
            <p className="text-muted-foreground">
              Paint specifications and availability are subject to change by manufacturers. 
              We are not responsible for discontinued products or specification changes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, The Paint Forge shall not be liable for any 
            indirect, incidental, special, or consequential damages arising from your use of our service. 
            Our total liability shall not exceed the amount you paid for our service (which is currently free).
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Privacy and Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your use of our service is also governed by our Privacy Policy. We collect minimal data 
            necessary to provide our service and protect user privacy according to applicable laws.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Account Termination and Enforcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Immediate Termination</h3>
            <p className="text-muted-foreground mb-2">
              We reserve the right to immediately terminate user accounts without warning for the following violations:
            </p>
            <ul className="space-y-1 text-muted-foreground mb-3">
              <li>• Uploading inappropriate, illegal, or offensive imagery</li>
              <li>• Violation of image content policy</li>
              <li>• Harassment or abuse of other users</li>
              <li>• Attempting to compromise system security</li>
              <li>• Repeated violations of these terms</li>
            </ul>
            <p className="text-red-400 font-medium">
              Account termination includes permanent deletion of all user data, projects, and uploaded content. 
              This action is irreversible and no data recovery is possible.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Legal Reporting</h3>
            <p className="text-muted-foreground">
              We are legally obligated to report illegal content to appropriate authorities. This includes but is not limited to:
            </p>
            <ul className="space-y-1 text-muted-foreground mb-2">
              <li>• Child exploitation or abuse material</li>
              <li>• Terrorist or extremist content</li>
              <li>• Threats of violence or harm</li>
              <li>• Any content that violates federal, state, or local laws</li>
            </ul>
            <p className="text-red-400 font-medium">
              User IP addresses, account information, and uploaded content may be provided to law enforcement 
              agencies as required by law or legal process.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Content Monitoring</h3>
            <p className="text-muted-foreground">
              We employ automated and manual content monitoring systems. All uploaded images are subject to review. 
              We reserve the right to remove any content that violates these terms at any time.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Modifications and Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Service Changes</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify or discontinue our service with reasonable notice. 
              We will provide data export options if service termination becomes necessary.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Terms Updates</h3>
            <p className="text-muted-foreground">
              These terms may be updated periodically. Continued use after changes constitutes 
              acceptance of new terms.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            For questions about these Terms of Service, please contact us at: support@paintforge.app
          </p>
          <p className="text-muted-foreground mt-2">
            These terms are governed by applicable laws and any disputes will be resolved through 
            appropriate legal channels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
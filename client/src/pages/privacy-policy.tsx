import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-orange-500 gothic-shadow mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Account Information</h3>
            <p className="text-muted-foreground">
              When you create an account, we collect your email address for authentication and communication purposes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Paint Inventory Data</h3>
            <p className="text-muted-foreground">
              We store your personal paint inventory selections and project information to provide our service.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500 mb-2">Usage Information</h3>
            <p className="text-muted-foreground">
              We may collect information about how you use our service to improve functionality and user experience.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3 text-muted-foreground">
            <li>• Provide and maintain The Paint Forge service</li>
            <li>• Authenticate user accounts and maintain security</li>
            <li>• Store and sync your paint inventory across devices</li>
            <li>• Enable project showcase and sharing features</li>
            <li>• Improve our service based on usage patterns</li>
            <li>• Communicate important service updates</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Data Storage and Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your data is stored securely using industry-standard practices. We implement appropriate technical 
            and organizational measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction.
          </p>
          <p className="text-muted-foreground">
            Your paint inventory and project data belongs to you. You can export or delete your data at any time 
            through your account settings.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Paint Forge uses Google AdSense for advertising. Google may collect information about your 
            visits to this site and other websites to provide relevant advertisements. You can opt out of 
            personalized advertising by visiting Google's Ad Settings.
          </p>
          <p className="text-muted-foreground">
            We do not sell, trade, or otherwise transfer your personal information to third parties except 
            as described in this policy.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3 text-muted-foreground">
            <li>• Access your personal data</li>
            <li>• Correct inaccurate information</li>
            <li>• Delete your account and associated data</li>
            <li>• Export your paint inventory and project data</li>
            <li>• Opt out of marketing communications</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy or your personal data, please contact us 
            through the contact form or at the email address provided in our Terms of Service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, UserPlus } from "lucide-react";
import { Link } from "wouter";

interface AccountWarningProps {
  action: string; // e.g., "add paints", "create projects"
  className?: string;
}

export function AccountWarning({ action, className = "" }: AccountWarningProps) {
  return (
    <Alert className={`border-amber-500 bg-amber-500/20 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-amber-800 dark:text-amber-200 font-medium">
          <strong>Beware:</strong> Without an account created, any saved work will be lost when you {action}.
        </span>
        <Link href="/register">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign up for free
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
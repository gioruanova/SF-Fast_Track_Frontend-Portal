import { cn } from "@/lib/utils";

interface ValidationMessageProps {
  message: string;
  actionLink?: {
    text: string;
    href: string;
  };
  className?: string;
}

export function ValidationMessage({
  message,
  actionLink,
  className,
}: ValidationMessageProps) {
  return (
    <div
      className={cn(
        "p-4 bg-muted rounded-md border border-destructive/20",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {message}{" "}
        {actionLink && (
          <a
            href={actionLink.href}
            className="text-primary hover:underline font-medium"
          >
            {actionLink.text}
          </a>
        )}
      </p>
    </div>
  );
}


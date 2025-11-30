import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { User } from "@/types/users";
import { generateDefaultPassword } from "@/lib/apiHelpers";

interface UserPasswordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: (password: string) => Promise<void>;
}

export function UserPasswordSheet({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UserPasswordSheetProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && user) {
      const defaultPassword = generateDefaultPassword(user.user_dni);
      setPassword(defaultPassword);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setPassword("");
    }
  }, [open, user]);

  const handleSubmit = async () => {
    if (!password.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(password.trim());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Cambiar Contraseña</SheetTitle>
          <SheetDescription className="flex flex-col gap-2">
            <span>Esta opción es únicamente para cuando el usuario esté bloqueado y necesite reestablecerse.</span>
            <span>Cambia la contraseña del usuario {user?.user_complete_name}</span>
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="new_password"
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sugerencia: Fast + últimos 4 dígitos del DNI
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || !password.trim()}
            >
              {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


import { LoginForm } from "@/components/auth/login-form";
import { InstallButton } from "@/components/pwa/InstallButton";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <InstallButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/assets/sample-image.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}

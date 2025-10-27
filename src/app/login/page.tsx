import { LoginForm } from "@/components/auth/login-form";
import { InstallButton } from "@/components/pwa/InstallButton";
import Image from "next/image";
import { ShapeLeft } from "@/components/ui/shape";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 relative">
      <ShapeLeft />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <InstallButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
        {/* <div className="flex flex-col justiy-center items-center">
          <span>owner@gmail.com</span>
          <span>operador-1@gmail.com</span>
          <span>profesional-2@gmail.com</span>
        </div> */}
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/assets/sample-image.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
          priority={true}
        />

        {/* TODO: Quitar esto para produccion */}
        <h1 className="text-8xl font-bold text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col italic" style={{ textShadow: '2px 2px 8px indigo' }}>
          <span className="font-bold">Fast</span>
          <span className="font-normal">Track</span>
        </h1>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#111111] px-4">
      <div className="text-center space-y-6 max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl">🐾</span>
          <h1 className="text-5xl font-bold text-[#f5f5f5]">Zoo Scheduler</h1>
        </div>
        <p className="text-xl text-[#a1a1aa]">
          Role-based scheduling application for zoo operations. Manage missions,
          teams, shifts, and PTO with ease.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/sign-in">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg" variant="outline">
              Sign Up
            </Button>
          </Link>
        </div>
        <div className="pt-8 text-sm text-[#a1a1aa]">
          <p>Features: Panama 2-2-3 scheduling, PTO management, and more</p>
        </div>
      </div>
    </div>
  );
}

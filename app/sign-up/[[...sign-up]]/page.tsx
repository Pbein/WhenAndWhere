import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg bg-[#1a1a1a] border-[#2a2a2a]",
            formButtonPrimary: "bg-[#10b981] hover:bg-[#059669]",
            formFieldInput: "bg-[#111111] border-[#2a2a2a] text-[#f5f5f5]",
            footerActionLink: "text-[#10b981] hover:text-[#059669]"
          },
          variables: {
            colorPrimary: "#10b981",
            colorBackground: "#1a1a1a",
            colorInputBackground: "#111111",
            colorInputText: "#f5f5f5",
            colorText: "#f5f5f5",
            colorTextSecondary: "#a1a1aa"
          }
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}








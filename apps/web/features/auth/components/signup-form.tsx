"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { authClient } from "@repo/auth/client";

export type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export interface SignupFormProps extends React.ComponentProps<"div"> {}

export function SignupForm({ className, ...props }: SignupFormProps) {
  const router = useRouter();
  const { register, handleSubmit } = useForm<SignupFormValues>();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleGithubSignIn = async () => {
    setErrorMsg(null);
    setIsPending(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "GitHub authentication failed");
      setIsPending(false);
    }
  };

  const handleSignup: SubmitHandler<SignupFormValues> = async (values) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (values.password !== values.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (values.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    setIsPending(true);
    try {
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (error) {
        throw new Error(error.message || "Registration failed");
      }

      setSuccessMsg("Account created successfully. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed");
      setIsPending(false);
    }
  };

  return (
    <div className={cn("w-full max-w-sm flex flex-col gap-6 font-mono", className)} {...props}>
      <div className="border border-[rgba(15,0,0,0.12)] bg-[#fdfcfc] rounded-none p-6 space-y-6">
        <div>
          <div className="text-[10px] text-[#646262] mb-1 font-bold select-none">Join Koro</div>
          <h2 className="text-base font-bold text-[#201d1d] tracking-tight">Create an Account</h2>
          <div className="h-px bg-[rgba(15,0,0,0.12)] my-3" />
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#fdfcfc] border border-[#ff3b30] text-[#ff3b30] text-xs font-bold rounded-[4px] select-none">
            Error: {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#fdfcfc] border border-[#30d158] text-[#30d158] text-xs font-bold rounded-[4px] select-none">
            Success: {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-[11px] font-bold text-[#201d1d] block select-none"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              disabled={isPending}
              className="w-full h-10 px-3 py-2 bg-[#f8f7f7] border border-[rgba(15,0,0,0.12)] rounded-[4px] text-[#201d1d] font-mono text-sm placeholder-[#9a9898] focus:bg-[#fdfcfc] focus:border-[#201d1d] focus:outline-none transition-colors duration-150 disabled:opacity-50"
              {...register("name", { required: true })}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[11px] font-bold text-[#201d1d] block select-none"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isPending}
              className="w-full h-10 px-3 py-2 bg-[#f8f7f7] border border-[rgba(15,0,0,0.12)] rounded-[4px] text-[#201d1d] font-mono text-sm placeholder-[#9a9898] focus:bg-[#fdfcfc] focus:border-[#201d1d] focus:outline-none transition-colors duration-150 disabled:opacity-50"
              {...register("email", { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-[11px] font-bold text-[#201d1d] block select-none"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={isPending}
                className="w-full h-10 px-3 py-2 bg-[#f8f7f7] border border-[rgba(15,0,0,0.12)] rounded-[4px] text-[#201d1d] font-mono text-sm placeholder-transparent focus:bg-[#fdfcfc] focus:border-[#201d1d] focus:outline-none transition-colors duration-150 disabled:opacity-50"
                {...register("password", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-[11px] font-bold text-[#201d1d] block select-none"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                disabled={isPending}
                className="w-full h-10 px-3 py-2 bg-[#f8f7f7] border border-[rgba(15,0,0,0.12)] rounded-[4px] text-[#201d1d] font-mono text-sm placeholder-transparent focus:bg-[#fdfcfc] focus:border-[#201d1d] focus:outline-none transition-colors duration-150 disabled:opacity-50"
                {...register("confirmPassword", { required: true })}
              />
            </div>
          </div>
          <div className="text-[10px] text-[#646262] select-none">
            Password must be at least 8 characters long.
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 bg-[#201d1d] text-[#fdfcfc] hover:bg-[#0f0000] active:bg-[#0f0000] rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 disabled:bg-[#f1eeee] disabled:text-[#9a9898] disabled:cursor-not-allowed select-none"
          >
            {isPending && !successMsg ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(15,0,0,0.12)]" />
          </div>
          <span className="relative px-3 bg-[#fdfcfc] text-[10px] text-[#9a9898] font-bold select-none">
            OR
          </span>
        </div>

        <button
          type="button"
          onClick={handleGithubSignIn}
          disabled={isPending}
          className="w-full h-10 bg-[#fdfcfc] text-[#201d1d] border border-[#646262] hover:bg-[#f8f7f7] active:bg-[#f1eeee] rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          Sign up with GitHub
        </button>

        <div className="text-center text-xs text-[#646262] pt-2 select-none border-t border-[rgba(15,0,0,0.12)]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-[#201d1d] font-bold underline decoration-[rgba(15,0,0,0.3)] hover:no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="px-6 text-center text-[10px] text-[#646262] select-none leading-normal">
        By creating an account, you agree to our{" "}
        <a href="#" className="underline hover:text-[#201d1d]">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-[#201d1d]">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailSignupFormProps {
  callbackUrl: string;
  buttonText: string;
}

export function EmailSignupForm({ callbackUrl, buttonText }: EmailSignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsPending(true);

    const { data, error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || "Failed to create account");
      setIsPending(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-4">
      {error ? (
        <p className="w-full rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Input
        name="name"
        type="text"
        placeholder="Імʼя"
        className="text-sm"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        name="email"
        type="email"
        placeholder="Пошта"
        className="text-sm"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        name="password"
        type="password"
        placeholder="Пароль"
        className="text-sm"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Input
        name="confirm"
        type="password"
        placeholder="Підтвердити пароль"
        className="text-sm"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Зачекайте..." : buttonText}
      </Button>
    </form>
  );
}

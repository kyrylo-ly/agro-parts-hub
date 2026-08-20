"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailLoginFormProps {
  callbackUrl: string;
  buttonText: string;
}

export function EmailLoginForm({ callbackUrl, buttonText }: EmailLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password");
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
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Зачекайте..." : buttonText}
      </Button>
    </form>
  );
}

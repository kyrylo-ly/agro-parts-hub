import { signupWithEmailAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Signup1Props {
  heading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  loginUrl?: string;
  errorMessage?: string;
  className?: string;
}

const Signup1 = ({
  heading = "Signup",
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Create Account",
  signupText = "Already a user?",
  loginUrl = "/login",
  errorMessage,
  className,
}: Signup1Props) => {
  return (
    <section className={cn("h-screen bg-muted", className)}>
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <Link href={logo.url}>
          </Link>
          <form action={signupWithEmailAction}
            className="flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 rounded-md border border-muted bg-background px-6 py-8 shadow-md">
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            {errorMessage ? (
              <p className="w-full rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
            <Input
              name="name"
              type="text"
              placeholder="Name"
              className="text-sm"
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              className="text-sm"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              className="text-sm"
              required
            />
            <Input
              name="confirm"
              type="password"
              placeholder="Confirm Password"
              className="text-sm"
              required
            />
            <Button type="submit" className="w-full">
              {buttonText}
            </Button>
          </form>
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{signupText}</p>
            <Link
              href={loginUrl}
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section >
  );
};

export { Signup1 };

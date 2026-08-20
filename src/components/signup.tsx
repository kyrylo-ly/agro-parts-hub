import { EmailSignupForm } from "./email-signup-form";
import { AuthLayout } from "./auth-layout";

interface SignupProps {
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
  callbackUrl: string;
  className?: string;
}

const Signup = ({
  heading = "Реєстрація",
  logo,
  buttonText = "Створити акаунт",
  googleText = "Увійти через Google",
  signupText = "Вже є акаунт?",
  loginUrl = "/login",
  errorMessage,
  callbackUrl,
  className,
}: SignupProps) => {
  return (
    <AuthLayout
      heading={heading}
      logo={logo}
      googleText={googleText}
      bottomText={signupText}
      bottomLinkText="Увійти"
      bottomLinkUrl={loginUrl}
      callbackUrl={callbackUrl}
      errorMessage={errorMessage}
      className={className}
    >
      <EmailSignupForm callbackUrl={callbackUrl} buttonText={buttonText} />
    </AuthLayout>
  );
};

export { Signup };

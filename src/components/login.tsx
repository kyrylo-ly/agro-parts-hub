import { EmailLoginForm } from "./email-login-form";
import { AuthLayout } from "./auth-layout";

interface LoginProps {
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
  signupUrl?: string;
  errorMessage?: string;
  callbackUrl: string;
  className?: string;
}

const Login = ({
  heading = "Вхід",
  logo,
  buttonText = "Увійти",
  googleText = "Увійти через Google",
  signupText = "Немає акаунту?",
  signupUrl = "/signup",
  errorMessage,
  callbackUrl,
  className,
}: LoginProps) => {
  return (
    <AuthLayout
      heading={heading}
      logo={logo}
      googleText={googleText}
      bottomText={signupText}
      bottomLinkText="Зареєструватись"
      bottomLinkUrl={signupUrl}
      callbackUrl={callbackUrl}
      errorMessage={errorMessage}
      className={className}
    >
      <EmailLoginForm callbackUrl={callbackUrl} buttonText={buttonText} />
    </AuthLayout>
  );
};

export { Login };

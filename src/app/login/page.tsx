import { Login } from "@/components/login";
import { getSafeCallbackUrl } from "@/lib/utils";

type LoginPageProps = {
    searchParams?: Promise<{
        error?: string;
        callbackUrl?: string
    }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const errorMessage = params?.error;

    const safeCallbackUrl = getSafeCallbackUrl(params?.callbackUrl);

    return <Login errorMessage={errorMessage} callbackUrl={safeCallbackUrl} />;
}

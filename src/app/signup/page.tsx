import { Signup } from "@/components/signup";
import { getSafeCallbackUrl } from "@/lib/utils";

type SignupPageProps = {
    searchParams?: Promise<{
        error?: string;
        callbackUrl?: string;
    }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const params = await searchParams;
    const errorMessage = params?.error;

    const safeCallbackUrl = getSafeCallbackUrl(params?.callbackUrl);

    return <Signup errorMessage={errorMessage} callbackUrl={safeCallbackUrl} />;
}

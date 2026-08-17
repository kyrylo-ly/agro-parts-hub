import { Signup1 } from "@/components/signup1";

type SignupPageProps = {
    searchParams?: Promise<{
        error?: string;
    }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const params = await searchParams;
    const errorMessage = params?.error;

    return <Signup1 errorMessage={errorMessage} />;
}

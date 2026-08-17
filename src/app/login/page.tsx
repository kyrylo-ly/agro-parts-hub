import { Login1 } from "@/components/login1";

type LoginPageProps = {
    searchParams?: Promise<{
        error?: string;
    }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const errorMessage = params?.error;

    return <Login1 errorMessage={errorMessage} />;
}

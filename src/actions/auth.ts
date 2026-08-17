"use server";

import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

const LOGIN_ERROR_FALLBACK = "Invalid email or password";
const SIGNUP_ERROR_FALLBACK = "Unable to create account";

type BetterAuthError = {
    body?: {
        message?: string;
    };
    message?: string;
};

function getAuthErrorMessage(error: unknown, fallback: string) {
    const candidate = error as BetterAuthError;
    return candidate.body?.message ?? candidate.message ?? fallback;
}

function readRequiredFormValue(formData: FormData, key: string) {
    const value = formData.get(key);
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

export async function loginWithEmailAction(formData: FormData) {
    const email = readRequiredFormValue(formData, "email");
    const password = readRequiredFormValue(formData, "password");

    if (!email || !password) {
        redirect("/login?error=Email%20and%20password%20are%20required");
    }

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        });
    } catch (error) {
        const message = encodeURIComponent(
            getAuthErrorMessage(error, LOGIN_ERROR_FALLBACK),
        );
        redirect(`/login?error=${message}`);
    }

    redirect("/");
}

export async function signupWithEmailAction(formData: FormData) {
    const name = readRequiredFormValue(formData, "name");
    const email = readRequiredFormValue(formData, "email");
    const password = readRequiredFormValue(formData, "password");
    const confirmPassword = readRequiredFormValue(formData, "confirm");

    if (!name || !email || !password || !confirmPassword) {
        redirect("/signup?error=Name%2C%20email%20and%20password%20are%20required");
    }

    if (password !== confirmPassword) {
        redirect("/signup?error=Passwords should be the same");
    }

    try {
        await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
            headers: await headers(),
        });
    } catch (error) {
        const message = encodeURIComponent(
            getAuthErrorMessage(error, SIGNUP_ERROR_FALLBACK),
        );
        redirect(`/signup?error=${message}`);
    }

    redirect("/");
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers(),
    });
}

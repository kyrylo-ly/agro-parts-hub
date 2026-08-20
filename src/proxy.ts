import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";

function redirectToLoginWithCallbackUrl(pathname: string, requestUrl: string) {
    const loginUrl = new URL("/login", requestUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const sessionCookie = getSessionCookie(request)

    if (!sessionCookie) {
        return redirectToLoginWithCallbackUrl(pathname, request.url)
    }

    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        return redirectToLoginWithCallbackUrl(pathname, request.url)
    }

    if (request.nextUrl.pathname.startsWith("/admin") && session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=forbidden", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/favorites", "/admin/:path*"],
};

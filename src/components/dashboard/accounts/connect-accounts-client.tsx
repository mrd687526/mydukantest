"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Facebook,
  CheckCircle,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import type { FacebookPage, ConnectedAccount } from "@/lib/types";
import { connectFacebookPage } from "@/app/actions/accounts";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

interface ConnectAccountsClientProps {
  connectedAccounts: ConnectedAccount[];
  fbAppId: string | null;
}

export function ConnectAccountsClient({
  connectedAccounts,
  fbAppId,
}: ConnectAccountsClientProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!fbAppId) {
      return;
    }

    if (document.getElementById("facebook-jssdk")) {
      setSdkLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: fbAppId,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      setSdkLoaded(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [fbAppId]);

  const handleFacebookLogin = () => {
    if (!sdkLoaded) {
      toast.error("Facebook SDK not loaded yet. Please wait a moment.");
      return;
    }
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          fetchPages(response.authResponse.accessToken);
        } else {
          toast.error("Facebook login was cancelled or failed.");
        }
      },
      {
        scope:
          "public_profile,email,pages_show_list,pages_manage_posts,pages_read_engagement",
      }
    );
  };

  const fetchPages = async (accessToken: string) => {
    setIsLoading(true);
    toast.loading("Fetching your Facebook pages...");
    try {
      const res = await fetch("/api/facebook/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      toast.dismiss();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch pages.");
      }
      setAvailablePages(data.pages);
      if (data.pages.length > 0) {
        toast.success("Pages loaded successfully! Select a page to connect.");
      } else {
        toast.info("No Facebook pages found for your account.");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectPage = async (page: FacebookPage) => {
    const promise = connectFacebookPage(page);
    toast.promise(promise, {
      loading: `Connecting ${page.name}...`,
      success: `${page.name} connected successfully!`,
      error: "Failed to connect page.",
    });
  };

  const isPageConnected = (pageId: string) => {
    return connectedAccounts.some((acc) => acc.fb_page_id === pageId);
  };

  if (!fbAppId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Configuration Required
          </CardTitle>
          <CardDescription>
            You need to add your Facebook App ID in the settings before you can
            connect an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/settings">Go to Settings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect a Facebook Page</CardTitle>
          <CardDescription>
            Click the button below to log in with Facebook and authorize the app
            to manage your pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleFacebookLogin}
            disabled={!sdkLoaded || isLoading}
          >
            <Facebook className="mr-2 h-4 w-4" />
            {isLoading ? "Loading..." : "Connect with Facebook"}
          </Button>
        </CardContent>
      </Card>

      {availablePages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Pages</CardTitle>
            <CardDescription>
              Choose a page to connect to the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {availablePages.map((page) => (
                <li
                  key={page.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{page.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.category}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleConnectPage(page)}
                    disabled={isPageConnected(page.id)}
                  >
                    {isPageConnected(page.id) ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Connected
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" /> Connect
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Already Connected</CardTitle>
            <CardDescription>
              These pages are currently connected to your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {connectedAccounts.map((acc) => (
                <li
                  key={acc.id}
                  className="flex items-center p-2 border rounded-md"
                >
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  <p className="font-medium">Page ID: {acc.fb_page_id}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
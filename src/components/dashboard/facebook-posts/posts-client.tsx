"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConnectedAccount, FacebookPost } from "@/lib/types";

interface PostsClientProps {
  accounts: ConnectedAccount[];
}

export function PostsClient({ accounts }: PostsClientProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountChange = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsLoading(true);
    setPosts([]);

    const account = accounts.find((acc) => acc.id === accountId);
    if (!account || !account.access_token) {
      toast.error("Could not find account details or access token.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/facebook/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: account.fb_page_id,
          accessToken: account.access_token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch posts.");
      }
      setPosts(data.posts);
    } catch (error: any) {
      toast.error("Failed to fetch posts", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No Facebook pages connected.</p>
            <Button variant="link" asChild>
              <Link href="/dashboard/accounts">
                Connect a page to get started.
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Select onValueChange={handleAccountChange}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select a Facebook Page" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  Page ID: {account.fb_page_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardDescription>
                  {new Date(post.created_time).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                {post.full_picture && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={post.full_picture}
                      alt="Post image"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      className="rounded-md"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {post.message || "This post has no text content."}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <a
                    href={post.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Facebook
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && selectedAccountId && posts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No posts found for this page.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
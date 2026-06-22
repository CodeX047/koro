"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/api/auth";

export function ProfileCard(props: React.ComponentProps<"div">) {
  const { user, isFetching, isLoading, error } = useUser();

  return (
    <div {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>User account information</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isFetching ? (
            <div>Loading user...</div>
          ) : error ? (
            <div>Error loading user: {String(error)}</div>
          ) : !user ? (
            <div>No user signed in.</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{(user as any).fullName || (user as any).name || "—"}</div>

              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{(user as any).email || "—"}</div>

              <div className="text-sm text-muted-foreground">ID</div>
              <div className="font-mono text-xs">{(user as any).id || "—"}</div>

              <div className="pt-3">
                <Button onClick={() => console.log("user object:", user)}>Log user</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileCard;

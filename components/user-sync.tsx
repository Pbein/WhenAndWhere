"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * Component that automatically syncs the authenticated Clerk user to Convex.
 * This handles the case where a user signs in/signs up via Clerk but hasn't
 * been synced to the Convex database yet.
 * 
 * IMPORTANT: This component blocks rendering of children until the user is synced.
 * This prevents race conditions where queries run before the user exists in the database.
 */
export function UserSync({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUser = useQuery(api.users.current);
  const ensureUser = useMutation(api.users.ensureCurrentUser);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Only run when auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn) return;

    // If user is signed in but not in database, sync them
    if (currentUser === null && !isSyncing) {
      setIsSyncing(true);
      ensureUser()
        .then(() => {
          // The query will automatically refetch and update currentUser
          setIsSyncing(false);
        })
        .catch((error) => {
          console.error("Failed to sync user:", error);
          setIsSyncing(false);
        });
    }
  }, [isLoaded, isSignedIn, currentUser, ensureUser, isSyncing]);

  // Show loading state while:
  // - Auth is loading
  // - User is signed in but we're still fetching their data (undefined)
  // - User is signed in but not yet synced to database (null) and we're syncing
  if (!isLoaded) {
    return <LoadingScreen message="Loading..." />;
  }

  if (isSignedIn && currentUser === undefined) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  if (isSignedIn && currentUser === null) {
    return <LoadingScreen message="Setting up your account..." />;
  }

  return <>{children}</>;
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <p className="text-sm font-medium text-gray-600">{message}</p>
      </div>
    </div>
  );
}


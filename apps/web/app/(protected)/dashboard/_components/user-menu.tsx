"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@repo/auth/client";

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending || !session?.user) {
    return (
      <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--koro-hairline-strong)" }}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[var(--koro-surface-dark-elevated)]" />
          <div className="flex flex-col gap-1 w-full">
            <div className="h-3 bg-[var(--koro-surface-dark-elevated)] rounded-sm w-full" />
            <div className="h-2 bg-[var(--koro-surface-dark-elevated)] rounded-sm w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const { user } = session;
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--koro-hairline-strong)" }}>
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 flex-shrink-0 rounded-sm flex items-center justify-center text-[12px] font-bold"
          style={{
            backgroundColor: "var(--koro-surface-dark-elevated)",
            color: "var(--koro-on-primary)",
            border: "1px solid var(--koro-hairline-strong)",
          }}
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={32}
              height={32}
              className="w-full h-full object-cover rounded-sm"
            />
          ) : (
            displayName.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[12px] font-bold truncate text-[var(--koro-on-primary)]">
            {displayName}
          </span>
          <span className="text-[10px] truncate" style={{ color: "var(--koro-ash)" }}>
            {user.email}
          </span>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-1.5 rounded-sm transition-colors text-left px-2 flex items-center justify-between group"
        style={{ color: "var(--koro-ash)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--koro-surface-dark-elevated)";
          e.currentTarget.style.color = "var(--koro-on-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--koro-ash)";
        }}
      >
        <span>Log Out</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </button>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div
        className="flex justify-between items-center pb-4 border-b border-dashed"
        style={{ borderColor: "var(--koro-hairline-strong)" }}
      >
        <div className="space-y-3">
          <div
            className="h-5 w-32 rounded-sm"
            style={{ backgroundColor: "var(--koro-surface-dark-elevated)" }}
          ></div>
          <div
            className="h-3 w-64 rounded-sm"
            style={{ backgroundColor: "var(--koro-surface-dark-elevated)", opacity: 0.5 }}
          ></div>
        </div>
        <div
          className="h-8 w-28 rounded-sm hidden sm:block"
          style={{ backgroundColor: "var(--koro-surface-dark-elevated)" }}
        ></div>
      </div>

      {/* Content Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-sm flex flex-col gap-4"
            style={{
              border: "1px solid var(--koro-hairline-strong)",
              backgroundColor: "var(--koro-surface-dark)",
            }}
          >
            <div className="flex justify-between items-start">
              <div
                className="h-4 w-1/2 rounded-sm"
                style={{ backgroundColor: "var(--koro-surface-dark-elevated)" }}
              ></div>
              <div
                className="h-4 w-6 rounded-sm"
                style={{ backgroundColor: "var(--koro-surface-dark-elevated)" }}
              ></div>
            </div>
            <div className="space-y-2.5">
              <div
                className="h-2 w-full rounded-sm"
                style={{ backgroundColor: "var(--koro-surface-dark-elevated)", opacity: 0.5 }}
              ></div>
              <div
                className="h-2 w-4/5 rounded-sm"
                style={{ backgroundColor: "var(--koro-surface-dark-elevated)", opacity: 0.5 }}
              ></div>
            </div>
            <div
              className="h-2 w-1/3 mt-2 rounded-sm"
              style={{ backgroundColor: "var(--koro-surface-dark-elevated)", opacity: 0.3 }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

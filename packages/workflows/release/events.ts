export type ReleaseEvents = {
  "release/readiness.requested": {
    data: {
      featureId: string;
      triggeredBy?: string;
      triggerType?: "manual" | "automatic";
    };
  };
  "release/readiness.completed": {
    data: {
      featureId: string;
      verdict: "READY" | "NOT_READY" | "READY_WITH_WARNINGS";
      score: number;
    };
  };
};

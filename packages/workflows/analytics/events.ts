export type AnalyticsEvents = {
  "development/event.created": {
    data: {
      featureId: string;
      source?: string;
    };
  };
  "analytics/updated": {
    data: {
      featureId: string;
      recalculatedAt: string;
    };
  };
};

export type PRDEvents = {
  /** Fired immediately after a feature is saved to DB — starts the pipeline */
  "feature/requested": {
    data: {
      featureId: string;
      title: string;
      description: string;
    };
  };
  /** Fired when clarification questions have been saved and are awaiting answers */
  "clarification/requested": {
    data: {
      featureId: string;
      questionCount: number;
    };
  };
  /** Fired when the user submits all their answers */
  "clarification/completed": {
    data: {
      featureId: string;
    };
  };
  /** Fired to start the PRD generation step */
  "prd/generation.requested": {
    data: {
      featureId: string;
    };
  };
  /** Fired after the PRD has been persisted */
  "prd/generated": {
    data: {
      featureId: string;
      prdId: string;
    };
  };
};

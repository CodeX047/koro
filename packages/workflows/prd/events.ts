export type PRDEvents = {
  "prd/generate.requested": {
    data: {
      featureRequestId: string;
      title: string;
      description: string;
    };
  };
  "prd/generated": {
    data: {
      featureRequestId: string;
      prdId: string;
    };
  };
};

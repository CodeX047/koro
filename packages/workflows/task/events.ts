export type TaskEvents = {
  "task/generation.requested": {
    data: {
      featureId: string;
      prdId: string;
    };
  };
  "task/generated": {
    data: {
      featureId: string;
    };
  };
  "planning/approved": {
    data: {
      featureId: string;
    };
  };
};

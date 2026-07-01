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
  "planning/completed": {
    data: {
      featureId: string;
    };
  };
};

export type TaskEvents = {
  "task/generate.requested": {
    data: {
      prdId: string;
      prdContent: string;
    };
  };
};

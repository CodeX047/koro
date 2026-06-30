export type ReviewEvents = {
  "review/pr.requested": {
    data: {
      pullRequestId: string;
    };
  };
  "review/pr.completed": {
    data: {
      pullRequestId: string;
      status: string;
    };
  };
};

export type NotificationEvents = {
  "notification/review.completed": {
    data: {
      pullRequestId: string;
      message: string;
    };
  };
};

export type GithubEvents = {
  "github/sync.requested": {
    data: {
      repoSyncId: string;
    };
  };
};

export type GithubEvents = {
  "github/sync.requested": {
    data: { repoSyncId: string };
  };
  "github/repository.connected": {
    data: { repositoryId: string };
  };
  "github/issues.sync.requested": {
    data: { featureId: string };
  };
  "github/issues.created": {
    data: { featureId: string; count: number };
  };
  "github/pr.event": {
    data: {
      installationId: number;
      repositoryFullName: string;
      payload: any;
    };
  };
};

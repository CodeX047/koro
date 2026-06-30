import type { PRDEvents } from "./prd/events";
import type { TaskEvents } from "./task/events";
import type { ReviewEvents } from "./review/events";
import type { ReleaseEvents } from "./release/events";
import type { GithubEvents } from "./github/events";
import type { NotificationEvents } from "./notification/events";

export type Events = 
  & PRDEvents 
  & TaskEvents 
  & ReviewEvents 
  & ReleaseEvents 
  & GithubEvents 
  & NotificationEvents;

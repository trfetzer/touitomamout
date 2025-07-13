import { readFile, writeFile } from "node:fs/promises";

import { QUEUE_PATH } from "../constants";

export interface QueueTweet {
  id: string;
  timestamp: number;
  inReplyToStatusId?: string;
}

export type Queue = QueueTweet[];

export const readQueue = async (): Promise<Queue> => {
  try {
    const content = await readFile(QUEUE_PATH, "utf-8");
    return JSON.parse(content) as Queue;
  } catch {
    return [];
  }
};

export const writeQueue = async (queue: Queue): Promise<void> => {
  await writeFile(QUEUE_PATH, JSON.stringify(queue));
};

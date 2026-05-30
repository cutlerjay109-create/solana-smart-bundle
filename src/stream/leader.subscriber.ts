import { Connection, PublicKey } from "@solana/web3.js";
import { createConnection } from "../config/rpc";
import { SlotState } from "../state/slot.state";

export interface LeaderInfo {
  slot: number;
  leader: string;
  isUpcoming: boolean;
}

export const getLeaderSchedule = async (): Promise<Map<string, number[]>> => {
  const connection = createConnection();
  const schedule = await connection.getLeaderSchedule();
  const leaderMap = new Map<string, number[]>();

  if (schedule) {
    Object.entries(schedule).forEach(([leader, slots]) => {
      leaderMap.set(leader, slots as number[]);
    });
  }

  return leaderMap;
};

export const getUpcomingLeaders = async (
  numSlots: number = 20
): Promise<LeaderInfo[]> => {
  const connection = createConnection();
  const currentSlot = SlotState.getCurrentSlot();
  const schedule = await connection.getLeaderSchedule();
  const leaders: LeaderInfo[] = [];

  if (schedule) {
    Object.entries(schedule).forEach(([leader, slots]) => {
      (slots as number[]).forEach((slot) => {
        if (slot >= currentSlot && slot <= currentSlot + numSlots) {
          leaders.push({
            slot,
            leader,
            isUpcoming: true,
          });
        }
      });
    });
  }

  return leaders.sort((a, b) => a.slot - b.slot);
};

export const isLeaderWindow = async (): Promise<boolean> => {
  const upcomingLeaders = await getUpcomingLeaders(4);
  return upcomingLeaders.length > 0;
};

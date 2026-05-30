import { getUpcomingLeaders, LeaderInfo } from "../stream/leader.subscriber";
import { SlotState } from "../state/slot.state";

export interface LeaderAnalysis {
  isGoodWindow: boolean;
  slotsUntilNextLeader: number;
  upcomingLeaders: LeaderInfo[];
  recommendation: string;
}

export const analyzeLeaderWindow = async (): Promise<LeaderAnalysis> => {
  const currentSlot = SlotState.getCurrentSlot();
  const upcomingLeaders = await getUpcomingLeaders(20);

  if (upcomingLeaders.length === 0) {
    return {
      isGoodWindow: false,
      slotsUntilNextLeader: 999,
      upcomingLeaders: [],
      recommendation: "No upcoming leaders found, wait for schedule update",
    };
  }

  const nextLeader = upcomingLeaders[0];
  const slotsUntilNextLeader = nextLeader.slot - currentSlot;

  let isGoodWindow: boolean;
  let recommendation: string;

  if (slotsUntilNextLeader <= 2) {
    isGoodWindow = true;
    recommendation = `Submit now, leader window in ${slotsUntilNextLeader} slots`;
  } else if (slotsUntilNextLeader <= 5) {
    isGoodWindow = true;
    recommendation = `Good window approaching in ${slotsUntilNextLeader} slots`;
  } else {
    isGoodWindow = false;
    recommendation = `Wait ${slotsUntilNextLeader} slots for next leader window`;
  }

  return {
    isGoodWindow,
    slotsUntilNextLeader,
    upcomingLeaders,
    recommendation,
  };
};

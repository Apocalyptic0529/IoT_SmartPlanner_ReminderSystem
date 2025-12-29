import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { StatsResponse } from "@shared/schema";

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async (): Promise<StatsResponse> => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return api.stats.get.responses[200].parse(data) as StatsResponse;
    },
  });
}

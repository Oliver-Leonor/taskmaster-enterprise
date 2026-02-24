import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export function useMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(),
    enabled,
    staleTime: 60_000,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fraudApi } from "../../core/api/endpoints/fraud.api";
// Assuming global toast store or hook
// import { useToastStore } from '../../store/ui/toast-store';
declare const useToastStore: any; // Fallback if auto-imported
declare const queryKeys: any; // Fallback if auto-imported

export const useBehaviorProfile = () => {
  return useQuery({
    queryKey: ["fraud", "behaviorProfile"],
    queryFn: async () => {
      const response = await fraudApi.getBehaviorProfile();
      return response.data;
    },
  });
};

export const useAdminBehaviorProfile = (userId: UUID) => {
  return useQuery({
    queryKey: ["fraud", "behaviorProfile", userId],
    queryFn: async () => {
      const response = await fraudApi.getAdminBehaviorProfile(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useFraudSignals = () => {
  return useQuery({
    queryKey: ["fraud", "signals"],
    queryFn: async () => {
      const response = await fraudApi.getSignals();
      return response.data || [];
    },
  });
};

export const useFraudSignal = (signalId: UUID) => {
  return useQuery({
    queryKey: ["fraud", "signals", signalId],
    queryFn: async () => {
      const response = await fraudApi.getSignalById(signalId);
      return response.data;
    },
    enabled: !!signalId,
  });
};

export const useUpdateFraudSignal = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async ({
      signalId,
      data,
    }: {
      signalId: UUID;
      data: Partial<FraudSignal>;
    }) => {
      const response = await fraudApi.updateSignal(signalId, data);
      return response.data;
    },
    onSuccess: (_, { signalId }) => {
      queryClient.invalidateQueries({ queryKey: ["fraud", "signals"] });
      queryClient.invalidateQueries({
        queryKey: ["fraud", "signals", signalId],
      });
      showToast("Signal updated successfully", "success");
    },
  });
};

export const useFraudCases = () => {
  return useQuery({
    queryKey: ["fraud", "cases"],
    queryFn: async () => {
      const response = await fraudApi.getCases();
      return response.data || [];
    },
  });
};

export const useFraudCase = (caseId: UUID) => {
  return useQuery({
    queryKey: ["fraud", "cases", caseId],
    queryFn: async () => {
      const response = await fraudApi.getCaseById(caseId);
      return response.data;
    },
    enabled: !!caseId,
  });
};

export const useCreateFraudCase = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (data: Partial<FraudCase>) => {
      const response = await fraudApi.createCase(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraud", "cases"] });
      showToast("Case created successfully", "success");
    },
  });
};

export const useUpdateFraudCase = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async ({
      caseId,
      data,
    }: {
      caseId: UUID;
      data: Partial<FraudCase>;
    }) => {
      const response = await fraudApi.updateCase(caseId, data);
      return response.data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["fraud", "cases"] });
      queryClient.invalidateQueries({ queryKey: ["fraud", "cases", caseId] });
      showToast("Case updated successfully", "success");
    },
  });
};

export const useVelocityRules = () => {
  return useQuery({
    queryKey: ["fraud", "velocityRules"],
    queryFn: async () => {
      const response = await fraudApi.getVelocityRules();
      return response.data || [];
    },
  });
};

export const useSecurityEvents = () => {
  return useQuery({
    queryKey: ["fraud", "securityEvents"],
    queryFn: async () => {
      const response = await fraudApi.getSecurityEvents();
      return response.data || [];
    },
  });
};

export const useFraudAnalytics = () => {
  return useQuery({
    queryKey: ["fraud", "analytics"],
    queryFn: async () => {
      const response = await fraudApi.getAnalytics();
      return response.data;
    },
  });
};

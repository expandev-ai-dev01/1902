import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditRequestService } from '../services';
import type { ApproveProposalOutput, RejectProposalOutput, ReturnProposalOutput } from '../types';

export const useEvaluationDetail = (id: number) => {
  return useQuery({
    queryKey: ['evaluation-detail', id],
    queryFn: () => creditRequestService.getEvaluationDetail(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useApproveProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveProposalOutput }) =>
      creditRequestService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-queue'] });
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
    },
  });
};

export const useRejectProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectProposalOutput }) =>
      creditRequestService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-queue'] });
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
    },
  });
};

export const useReturnProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnProposalOutput }) =>
      creditRequestService.return(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-queue'] });
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
    },
  });
};

import type { Wedding } from '@make-my-marriage/contracts';

export type WeddingOverviewState = {
  wedding: Wedding | null;
  error: string;
  unavailable: boolean;
  editing: boolean;
};
export const initialWeddingOverview: WeddingOverviewState = {
  wedding: null,
  error: '',
  unavailable: false,
  editing: false,
};
type Action =
  | { type: 'loaded'; wedding: Wedding }
  | { type: 'failed'; message: string; accessRejected: boolean }
  | { type: 'retry' }
  | { type: 'edit' }
  | { type: 'close' }
  | { type: 'saved'; wedding: Wedding };

export function weddingOverviewReducer(
  state: WeddingOverviewState,
  action: Action,
): WeddingOverviewState {
  switch (action.type) {
    case 'loaded':
      return {
        wedding: action.wedding,
        error: '',
        unavailable: false,
        editing: state.editing && action.wedding.role === 'WEDDING_ADMIN',
      };
    case 'failed':
      return action.accessRejected
        ? { wedding: null, editing: false, unavailable: true, error: action.message }
        : { ...state, error: action.message };
    case 'retry':
      return { ...state, error: '' };
    case 'edit':
      return state.wedding?.role === 'WEDDING_ADMIN' ? { ...state, editing: true } : state;
    case 'close':
      return { ...state, editing: false };
    case 'saved':
      return { wedding: action.wedding, editing: false, unavailable: false, error: '' };
  }
}

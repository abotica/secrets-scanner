export type TabName = 'git' | 'upload' | 'history';

export interface HistoryItem {
  id: number;
  timestamp: string;
  type: TabName;
  target: string;
  summary: {
    files_with_secrets: number;
  };
  full_result: any;
}

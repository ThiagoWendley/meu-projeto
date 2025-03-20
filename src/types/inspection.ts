export interface Inspection {
  id: number;
  sequentialCode?: string; // Código sequencial único da vistoria (001, 002, 003...)
  company: string;
  propertyCode: string;
  address: string;
  date: string;
  time: string;
  type: string;
  status?: string;
  inspector?: string;
  progress?: number;
  isContestacao?: boolean;
}

export type InspectionStatus = 'agendadas' | 'atribuidas' | 'andamento' | 'finalizadas'; 
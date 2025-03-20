'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, ArrowRight, Building2, Hash, Printer, Copy, RefreshCw, X, Search, Trash2 } from 'lucide-react';
import type { InspectionStatus } from './InspectionsTabBar';
import DeleteConfirm from '../modals/DeleteConfirm';
import { Inspection } from '@/types/inspection';

interface InspectionsListProps {
  status: InspectionStatus;
  onViewDetails?: (inspection: Inspection) => void;
}

// Dados simulados de vistorias como fallback
const mockInspections: Inspection[] = [
  {
    id: 1,
    company: 'Imob Premium',
    propertyCode: 'APT-123',
    address: 'Rua das Flores, 123 - Centro',
    date: '25/03/2024',
    time: '14:30',
    type: 'Entrada',
    inspector: 'João Silva',
    progress: 0,
    isContestacao: true
  },
  {
    id: 2,
    company: 'Imob Plus',
    propertyCode: 'CASA-456',
    address: 'Av. Principal, 456 - Jardins',
    date: '26/03/2024',
    time: '09:00',
    type: 'Saída',
    inspector: 'Maria Santos',
    progress: 65,
    isContestacao: false
  },
  {
    id: 3,
    company: 'Imob Master',
    propertyCode: 'SALA-789',
    address: 'Rua do Comércio, 789 - Centro',
    date: '26/03/2024',
    time: '15:45',
    type: 'Periódica',
    inspector: 'Pedro Costa',
    progress: 30,
    isContestacao: true
  }
];

// Função auxiliar para obter a cor do status
const getStatusColor = (status: InspectionStatus) => {
  const colors = {
    agendadas: 'bg-amber-50 text-amber-600',
    atribuidas: 'bg-blue-50 text-blue-600',
    andamento: 'bg-indigo-50 text-indigo-600',
    finalizadas: 'bg-emerald-50 text-emerald-600'
  };
  return colors[status];
};

export default function InspectionsList({ status, onViewDetails }: InspectionsListProps) {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isContestacao, setIsContestacao] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  
  // Carregar vistorias do localStorage
  useEffect(() => {
    const savedInspections = localStorage.getItem('vistorias');
    if (savedInspections) {
      try {
        const parsedInspections = JSON.parse(savedInspections);
        setInspections(parsedInspections);
      } catch (error) {
        console.error('Erro ao carregar vistorias:', error);
        setInspections(mockInspections);
      }
    } else {
      setInspections(mockInspections);
    }
  }, []);

  const handlePrint = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setIsPrintModalOpen(true);
  };

  const handleDuplicate = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setIsDuplicateModalOpen(true);
  };

  const handleSync = () => {
    if (confirm('Re-sincronizar\nEsta opção irá marcar esta vistoria para sincronização no APP, se a vistoria ja foi iniciada no app esta opção pode causar perdar de dados da vistoria no APP, confirma?')) {
      alert('Modificações enviadas para o app com sucesso!');
    }
  };

  const handleDelete = () => {
    if (selectedInspection) {
      // Remover vistoria do estado
      const updatedInspections = inspections.filter(i => i.id !== selectedInspection.id);
      setInspections(updatedInspections);
      
      // Atualizar localStorage
      localStorage.setItem('vistorias', JSON.stringify(updatedInspections));
      
      setIsDeleteModalOpen(false);
      setSelectedInspection(null);
    }
  };

  const canDelete = (status: InspectionStatus) => {
    return status === 'agendadas' || status === 'atribuidas';
  };
  
  // Cores modernas para os ícones baseadas no tipo de vistoria
  const getIconColor = (type: string) => {
    switch (type) {
      case 'Entrada':
        return 'text-emerald-500';
      case 'Saída':
        return 'text-purple-500';
      case 'Periódica':
        return 'text-blue-500';
      default:
        return 'text-gray-600';
    }
  };

  // Filtra as vistorias baseado no termo de busca e tipo selecionado
  const filteredInspections = inspections.filter(inspection => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = inspection.propertyCode?.toLowerCase().includes(searchLower) ||
      inspection.address?.toLowerCase().includes(searchLower);
    const matchesType = selectedType === '' || inspection.type === selectedType;
    const matchesStatus = inspection.status === status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      {/* Campo de Pesquisa e Filtros */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Pesquisar por código ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 text-sm placeholder:text-gray-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="w-56">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-3 px-4 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 text-sm appearance-none"
            aria-label="Filtrar por tipo de vistoria"
          >
            <option value="">Todos os tipos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
            <option value="Periódica">Periódica</option>
          </select>
        </div>

        <label className="flex items-center gap-3 py-1 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isContestacao}
              onChange={(e) => setIsContestacao(e.target.checked)}
            />
            <div className={`w-12 h-7 rounded-full transition-colors ${
              isContestacao ? 'bg-primary' : 'bg-gray-200'
            }`}>
              <div className={`absolute w-5 h-5 rounded-full bg-white top-1 transition-transform ${
                isContestacao ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">Contestação</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((inspection) => (
          <div 
            key={inspection.id}
            className={`bg-white rounded-xl p-4 hover:shadow-md transition-shadow space-y-4 ${
              inspection.isContestacao 
                ? 'border-2 border-red-200' 
                : 'border border-border'
            }`}
          >
            {/* Cabeçalho do Card */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${getIconColor(inspection.type)}`} />
                  <h3 className="font-semibold text-gray-900">{inspection.company}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {inspection.isContestacao && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>Contestação</span>
                    </div>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'andamento' ? 'Em Andamento' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className={`w-4 h-4 ${getIconColor(inspection.type)}`} />
                <span className="font-medium">
                  {inspection.sequentialCode || ''}
                </span>
              </div>
              <div className="flex items-start gap-1 text-sm text-gray-600">
                <MapPin className={`w-4 h-4 ${getIconColor(inspection.type)} flex-shrink-0 mt-0.5`} />
                <span className="line-clamp-2">{inspection.address}</span>
              </div>
            </div>

            {/* Informações da Vistoria */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className={`w-4 h-4 ${getIconColor(inspection.type)}`} />
                <span>{inspection.date}</span>
                <Clock className={`w-4 h-4 ml-2 ${getIconColor(inspection.type)}`} />
                <span>{inspection.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Tipo:</span>
                <span className={`${getIconColor(inspection.type)}`}>{inspection.type}</span>
              </div>
              {(status === 'atribuidas' || status === 'andamento' || status === 'finalizadas') && inspection.inspector && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className={`w-4 h-4 ${getIconColor(inspection.type)}`} />
                  <span>{inspection.inspector}</span>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="group relative">
                  <button
                    aria-label="Imprimir Laudo/Contestação"
                    title="Imprimir Laudo/Contestação"
                    onClick={() => handlePrint(inspection)}
                    className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Imprimir Laudo/Contestação
                  </div>
                </div>
                {status !== 'finalizadas' && (
                  <div className="group relative">
                    <button
                      aria-label="Duplicar Vistoria"
                      title="Duplicar Vistoria"
                      onClick={() => handleDuplicate(inspection)}
                      className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Duplicar Vistoria
                    </div>
                  </div>
                )}
                <div className="group relative">
                  <button 
                    aria-label="Sincronizar com App"
                    title="Sincronizar com App"
                    onClick={handleSync}
                    className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sincronizar com App
                  </div>
                </div>
                {canDelete(status) && (
                  <div className="group relative">
                    <button
                      aria-label="Excluir Vistoria"
                      title="Excluir Vistoria"
                      onClick={() => {
                        setSelectedInspection(inspection);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Excluir Vistoria
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => onViewDetails?.(inspection)}
                className={`flex items-center gap-2 text-sm font-medium ${getIconColor(inspection.type)} hover:opacity-80 transition-colors`}
                aria-label="Ver detalhes da vistoria"
              >
                <span>Ver Detalhes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal de Impressão */}
      {isPrintModalOpen && selectedInspection && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsPrintModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Geração do laudo de vistoria</h3>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Fechar"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" id="modelo-label">
                  Selecione um modelo:
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  aria-labelledby="modelo-label"
                >
                  <option value="">Selecione um modelo</option>
                  <option value="laudo">Laudo de Vistorias</option>
                  <option value="contestacao">Contestações</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">Campo obrigatório.</p>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="reportType" className="text-primary focus:ring-primary" />
                  <span className="text-gray-700">Gerar sem fotos</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="reportType" className="text-primary focus:ring-primary" />
                  <span className="text-gray-700">Gerar em PDF</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="reportType" className="text-primary focus:ring-primary" />
                  <span className="text-gray-700">Após gerar, enviar para assinatura</span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  alert('Laudo gerado com sucesso!');
                  setIsPrintModalOpen(false);
                }}
                className="px-4 py-2 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors"
              >
                Gerar laudo
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Duplicação */}
      {isDuplicateModalOpen && selectedInspection && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsDuplicateModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Duplicar Vistoria</h3>
              <button
                onClick={() => setIsDuplicateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Fechar"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                  defaultChecked 
                />
                <span className="text-gray-700">Mesmo imóvel (endereço)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                  defaultChecked 
                />
                <span className="text-gray-700">Com fotos</span>
              </label>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  alert('Vistoria duplicada com sucesso!');
                  setIsDuplicateModalOpen(false);
                }}
                className="px-4 py-2 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInspection(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Vistoria"
        description={`Tem certeza que deseja excluir esta vistoria? Esta ação não poderá ser desfeita.`}
      />
    </>
  );
} 
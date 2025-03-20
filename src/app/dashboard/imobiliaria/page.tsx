'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, ClipboardList, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, MapPin, Clock, Hash, ArrowRight, Search, Trash2, Printer, Copy, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Sidebar from '../../../components/layout/Sidebar';
import Charts from '../../../components/dashboard/Charts';
import InspectionsList from '../../../components/dashboard/InspectionsList';
import InspectionsTabBar, { InspectionStatus } from '../../../components/dashboard/InspectionsTabBar';
import SettingsManager from '../../../components/dashboard/SettingsManager';
import InspectionModal from '../../../components/modals/InspectionModal';
import type { InspectionFormData } from '../../../components/modals/InspectionModal';
import DeleteConfirm from '../../../components/modals/DeleteConfirm';
import PrintModal from '../../../components/modals/PrintModal';
import DuplicateModal from '../../../components/modals/DuplicateModal';
import { Inspection } from '@/types/inspection';
import ImobiliariaTabBar, { ImobiliariaInspectionStatus } from '../../../components/dashboard/ImobiliariaTabBar';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PropertyModal from '../../../components/modals/PropertyModal';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

const mockInspections: Inspection[] = [
  // Agendadas
  {
    id: 1,
    company: 'Imob Premium',
    propertyCode: 'APT-123',
    address: 'Rua das Flores, 123 - Centro',
    date: '25/03/2024',
    time: '14:30',
    type: 'Entrada',
    status: 'agendadas',
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
    status: 'agendadas',
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
    status: 'agendadas',
    isContestacao: false
  },
  // Em Andamento
  {
    id: 4,
    company: 'Imob Elite',
    propertyCode: 'APT-789',
    address: 'Av. das Palmeiras, 321 - Jardim América',
    date: '25/03/2024',
    time: '10:00',
    type: 'Entrada',
    status: 'andamento',
    isContestacao: true
  },
  {
    id: 5,
    company: 'Imob Prime',
    propertyCode: 'CASA-321',
    address: 'Rua dos Ipês, 567 - Vila Nova',
    date: '25/03/2024',
    time: '11:30',
    type: 'Saída',
    status: 'andamento',
    isContestacao: false
  },
  {
    id: 6,
    company: 'Imob Select',
    propertyCode: 'SALA-456',
    address: 'Av. Central, 890 - Centro',
    date: '25/03/2024',
    time: '13:15',
    type: 'Periódica',
    status: 'andamento',
    isContestacao: false
  },
  // Finalizadas
  {
    id: 7,
    company: 'Imob Gold',
    propertyCode: 'APT-456',
    address: 'Rua das Acácias, 234 - Jardim Europa',
    date: '24/03/2024',
    time: '15:00',
    type: 'Entrada',
    status: 'finalizadas',
    isContestacao: true
  },
  {
    id: 8,
    company: 'Imob Diamond',
    propertyCode: 'CASA-789',
    address: 'Av. dos Pinheiros, 678 - Alto da Boa Vista',
    date: '24/03/2024',
    time: '16:30',
    type: 'Saída',
    status: 'finalizadas',
    isContestacao: false
  },
  {
    id: 9,
    company: 'Imob Platinum',
    propertyCode: 'SALA-123',
    address: 'Rua do Parque, 901 - Moema',
    date: '24/03/2024',
    time: '17:45',
    type: 'Periódica',
    status: 'finalizadas',
    isContestacao: false
  }
];

// Mock de imóveis
const mockProperties = [
  {
    id: 1,
    code: 'APT-456',
    address: 'Rua das Acácias, 234 - Jardim Europa',
    type: 'Apartamento',
    area: '75m²',
    lastInspection: '24/03/2024',
    totalInspections: 5
  },
  {
    id: 2,
    code: 'CASA-789',
    address: 'Av. dos Pinheiros, 678 - Alto da Boa Vista',
    type: 'Casa',
    area: '150m²',
    lastInspection: '20/03/2024',
    totalInspections: 3
  },
  {
    id: 3,
    code: 'SALA-123',
    address: 'Rua do Parque, 901 - Moema',
    type: 'Sala Comercial',
    area: '45m²',
    lastInspection: '15/03/2024',
    totalInspections: 2
  }
];

export default function DashImobiliaria() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ImobiliariaInspectionStatus>('agendadas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  
  // Estado para gerenciar a lista de vistorias
  const [inspections, setInspections] = useState<Inspection[]>([]);
  
  // Estado para gerenciar a lista de imóveis
  const [properties, setProperties] = useState<any[]>([]);
  
  // Carrega as vistorias e imóveis do localStorage na inicialização
  useEffect(() => {
    // Carregar vistorias
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
      localStorage.setItem('vistorias', JSON.stringify(mockInspections));
    }
    
    // Carregar imóveis
    const savedProperties = localStorage.getItem('properties');
    
    if (savedProperties) {
      try {
        const parsedProperties = JSON.parse(savedProperties);
        setProperties(parsedProperties);
      } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        setProperties(mockProperties);
      }
    } else {
      setProperties(mockProperties);
      // Não salvamos automaticamente os mockProperties no localStorage
      // para não sobrescrever imóveis cadastrados pelo usuário
    }
  }, []);

  const handleAddInspection = () => {
    setSelectedInspection(null);
    setReadOnlyMode(false);
    setIsModalOpen(true);
  };

  const handleViewInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setReadOnlyMode(false);
    setIsModalOpen(true);
  };

  const handleSubmitInspection = (data: InspectionFormData) => {
    // Criar um objeto de vistoria a partir dos dados do formulário
    const newInspection: Inspection = {
      id: Math.floor(Math.random() * 10000), // Gera um ID aleatório
      sequentialCode: data.sequentialCode, // Código sequencial único da vistoria
      propertyCode: data.propertyId,
      address: data.address || 'Endereço não informado',
      date: data.scheduledDate,
      time: data.scheduledTime,
      type: data.inspectionType === 'entrada' 
        ? 'Entrada' 
        : data.inspectionType === 'saida' 
          ? 'Saída' 
          : 'Periódica',
      status: 'agendadas',
      company: 'Sua Imobiliária', // Nome da imobiliária atual
      isContestacao: false // Valor padrão
    };

    // Verificar se é uma edição ou nova vistoria
    if (selectedInspection) {
      // Edição - atualizar a vistoria existente
      const updatedInspections = inspections.map(item => 
        item.id === selectedInspection.id ? { ...newInspection, id: selectedInspection.id } : item
      );
      setInspections(updatedInspections);
      localStorage.setItem('vistorias', JSON.stringify(updatedInspections));
    } else {
      // Nova vistoria - adicionar à lista
      const updatedInspections = [...inspections, newInspection];
      setInspections(updatedInspections);
      localStorage.setItem('vistorias', JSON.stringify(updatedInspections));
    }
    
    // Fechar o modal
    setIsModalOpen(false);
    setSelectedInspection(null);
    
    // Garantir que a aba de "agendadas" esteja ativa para que o usuário veja a nova vistoria
    setActiveTab('agendadas');
  };

  const handleDelete = () => {
    if (selectedInspection) {
      // Remover a vistoria da lista
      const updatedInspections = inspections.filter(
        inspection => inspection.id !== selectedInspection.id
      );
      setInspections(updatedInspections);
      
      // Atualizar localStorage
      localStorage.setItem('vistorias', JSON.stringify(updatedInspections));
      
      // Fechar o modal e limpar a seleção
      setIsDeleteModalOpen(false);
      setSelectedInspection(null);
    }
  };

  // Filtra as vistorias baseado no termo de busca, tipo selecionado e aba ativa
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = searchTerm === '' || 
      inspection.propertyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || inspection.type === selectedType;
    
    return matchesSearch && matchesType && inspection.status === activeTab;
  });

  // Filtra os imóveis baseado no termo de busca
  const filteredProperties = properties.filter(property => {
    const matchesSearch = searchTerm === '' || 
      property.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Cores mais modernas para os ícones baseadas no tipo de vistoria
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

  // Cores mais modernas para os ícones baseadas no tipo de imóvel
  const getPropertyIconColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'apartamento':
        return 'text-blue-500';
      case 'casa':
        return 'text-emerald-500';
      case 'sala_comercial':
      case 'sala comercial':
        return 'text-amber-500';
      case 'galpao':
      case 'galpão':
        return 'text-purple-500';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: ImobiliariaInspectionStatus) => {
    const colors = {
      agendadas: 'bg-amber-50 text-amber-600',
      andamento: 'bg-indigo-50 text-indigo-600',
      finalizadas: 'bg-emerald-50 text-emerald-600',
      imoveis: 'bg-sky-50 text-sky-600'
    };
    return colors[status];
  };

  const renderContent = () => {
    if (activeTab === 'imoveis') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className={`w-4 h-4 ${getPropertyIconColor(property.type)}`} />
                      <span className="font-medium text-gray-900">{property.code}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(property);
                        setIsPropertyModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                      title="Editar imóvel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className={`w-4 h-4 ${getPropertyIconColor(property.type)} flex-shrink-0 mt-0.5`} />
                    <span className="text-sm text-gray-600 line-clamp-2">{property.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Tipo</span>
                    <p className={`text-sm font-medium ${getPropertyIconColor(property.type)}`}>{property.type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Área</span>
                    <p className="text-sm text-gray-900">{property.area ? `${property.area}m²` : 'Não informada'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Última vistoria:</span>
                      <span className="ml-1 text-gray-900">{property.lastInspection || 'Nenhuma'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-1 text-gray-900">{property.totalInspections || 0} vistorias</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 mt-2 border-t border-border">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/imobiliaria/imovel/${property.id}`);
                    }}
                    className="w-full py-2 text-center text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((inspection) => (
          <div
            key={inspection.id}
            className={`bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow ${
              inspection.isContestacao 
                ? 'border-2 border-red-200' 
                : 'border border-border'
            } ${inspection.status === 'agendadas' || inspection.status === 'andamento' ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (inspection.status === 'agendadas' || inspection.status === 'andamento') {
                handleViewInspection(inspection);
              }
            }}
          >
            {/* Status Badge */}
            <div className="px-4 py-2 bg-gray-50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status as ImobiliariaInspectionStatus)}`}>
                  {inspection.status ? (
                    inspection.status === 'andamento' 
                      ? 'Em Andamento' 
                      : inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)
                  ) : ''}
                </span>
                {inspection.isContestacao && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Contestação
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {inspection.status === ('finalizadas' as const) && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPrintModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                      title="Imprimir vistoria"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </>
                )}
                {inspection.status === ('agendadas' as const) && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInspection(inspection);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Excluir vistoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className={`w-4 h-4 ${getIconColor(inspection.type)}`} />
                  <span className="font-medium text-gray-900">
                    {inspection.sequentialCode || ''}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className={`w-4 h-4 ${getIconColor(inspection.type)} flex-shrink-0 mt-0.5`} />
                  <span className="text-sm text-gray-600 line-clamp-2">{inspection.address || 'Endereço não informado'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className={`w-4 h-4 ${getIconColor(inspection.type)}`} />
                  <span>{inspection.date}</span>
                  <Clock className={`w-4 h-4 ml-2 ${getIconColor(inspection.type)}`} />
                  <span>{inspection.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Tipo:</span>
                  <span className={`${getIconColor(inspection.type)} font-medium`}>{inspection.type}</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                {inspection.status === 'finalizadas' ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/imobiliaria/vistoria/${inspection.id}`);
                    }}
                    className={`flex items-center gap-1 text-sm font-medium ${getIconColor(inspection.type)} hover:opacity-80 transition-all`}
                  >
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que o clique seja propagado para o card
                      handleViewInspection(inspection);
                    }}
                    className={`flex items-center gap-1 text-sm font-medium ${getIconColor(inspection.type)} hover:opacity-80 transition-all`}
                  >
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Lógica para verificar se o botão "+ Nova Vistoria" deve ser exibido
  const shouldShowAddButton = activeTab !== 'imoveis';

  // Campo de busca e filtros
  const renderFiltersAndSearch = () => {
    return (
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

        {activeTab !== 'imoveis' && (
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
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ClientHeader 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)} 
        isMenuOpen={isMenuOpen} 
      />
      
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src="/logo-assinante.png"
              alt="Logo da empresa"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Nome da Empresa</h1>
        </div>
        <span className="text-xs text-gray-600">desenvolvido por Evolução Vistorias</span>
      </div>
      
      <main className="transition-all duration-300">
        <div className="p-4 md:p-6 space-y-6">
          {/* Barra de Tabs */}
          <div className="flex items-center justify-between">
            <ImobiliariaTabBar 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              onAddInspection={handleAddInspection} 
            />
            {activeTab === 'finalizadas' && (
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
              >
                <FileText className="w-4 h-4" />
                Gerar Relatório
              </button>
            )}
          </div>

          {/* Barra de pesquisa e filtros */}
          {renderFiltersAndSearch()}
          
          {/* Conteúdo das abas */}
          {renderContent()}
        </div>
      </main>

      {/* Modais */}
      <InspectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInspection(null);
        }}
        onSubmit={handleSubmitInspection}
        initialData={selectedInspection}
        title={selectedInspection ? 'Detalhes da Vistoria' : 'Nova Vistoria'}
        submitButtonText={selectedInspection ? 'Salvar Modificações' : 'Agendar Vistoria'}
      />

      {/* Modal de Edição de Imóvel */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setSelectedProperty(null);
        }}
        onSubmit={(data) => {
          // Atualizar o imóvel no localStorage
          const properties = localStorage.getItem('properties');
          if (properties) {
            try {
              const parsedProperties = JSON.parse(properties);
              const updatedProperties = parsedProperties.map((p: any) => 
                p.id === data.id ? data : p
              );
              localStorage.setItem('properties', JSON.stringify(updatedProperties));
              setProperties(updatedProperties);
            } catch (error) {
              console.error('Erro ao atualizar imóvel:', error);
            }
          }
          setIsPropertyModalOpen(false);
          setSelectedProperty(null);
        }}
        initialData={selectedProperty}
        isEditing={true}
      />
      
      {/* Modal de confirmação de exclusão */}
      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInspection(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Vistoria"
        description="Tem certeza que deseja excluir esta vistoria? Esta ação não poderá ser desfeita."
      />
      
      {/* Modal de Impressão */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onConfirm={() => setIsPrintModalOpen(false)}
      />
      
      {/* Modal de Duplicação */}
      <DuplicateModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirm={() => setIsDuplicateModalOpen(false)}
        inspectionData={{
          propertyId: selectedInspection?.propertyCode || '',
          propertyName: selectedInspection?.propertyCode || 'Não selecionado',
          inspectionType: selectedInspection?.type || 'Entrada'
        }}
      />
    </div>
  );
} 
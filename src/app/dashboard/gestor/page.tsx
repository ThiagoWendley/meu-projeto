'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, ClipboardList, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, MapPin, Clock, Hash, ArrowRight, Search, Trash2, FileText, Home } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '../../../components/layout/Sidebar';
import Charts from '../../../components/dashboard/Charts';
import RealEstateList from '../../../components/dashboard/RealEstateList';
import InspectorsList from '../../../components/dashboard/InspectorsList';
import InspectionsList from '../../../components/dashboard/InspectionsList';
import InspectionsTabBar, { InspectionStatus } from '../../../components/dashboard/InspectionsTabBar';
import SettingsManager from '../../../components/dashboard/SettingsManager';
import InspectionModal, { InspectionFormData } from '../../../components/modals/InspectionModal';
import DeleteConfirm from '../../../components/modals/DeleteConfirm';
import { Inspection } from '@/types/inspection';
import PropertyList from '@/components/dashboard/PropertyList';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function DashGestor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeInspectionTab, setActiveInspectionTab] = useState<InspectionStatus>('agendadas');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isContestacao, setIsContestacao] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [filterRealEstate, setFilterRealEstate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<InspectionStatus | ''>('');
  const [filterInspector, setFilterInspector] = useState<string>('');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 768);
    
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    
    // Carregar vistorias do localStorage
    const savedInspections = localStorage.getItem('vistorias');
    if (savedInspections) {
      try {
        const parsedInspections = JSON.parse(savedInspections);
        setInspections(parsedInspections);
      } catch (error) {
        console.error('Erro ao carregar vistorias:', error);
      }
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddInspection = () => {
    setIsInspectionModalOpen(true);
  };

  const handleSubmitInspection = (data: InspectionFormData) => {
    // Criar um objeto de vistoria a partir dos dados do formulário
    const newInspection: Inspection = {
      id: Math.floor(Math.random() * 10000), // Gera um ID aleatório
      sequentialCode: data.sequentialCode, // Código sequencial único da vistoria
      propertyCode: data.propertyId,
      address: '', // Idealmente, buscaríamos o endereço do imóvel pelo ID
      date: data.scheduledDate,
      time: data.scheduledTime,
      type: data.inspectionType === 'entrada' 
        ? 'Entrada' 
        : data.inspectionType === 'saida' 
          ? 'Saída' 
          : 'Periódica',
      status: data.status || 'agendadas',
      company: 'Gestão Vistorias', // Nome da empresa de gestão
      isContestacao: false // Valor padrão
    };

    // Adicionar a nova vistoria à lista
    const updatedInspections = [...inspections, newInspection];
    setInspections(updatedInspections);
    
    // Salvar no localStorage
    localStorage.setItem('vistorias', JSON.stringify(updatedInspections));
    
    // Fechar o modal
    setIsInspectionModalOpen(false);
    
    // Garantir que a aba de "agendadas" esteja ativa para que o usuário veja a nova vistoria
    setActiveInspectionTab('agendadas');
  };

  const handleDelete = () => {
    if (selectedInspection) {
      // Aqui você implementaria a lógica real de exclusão
      console.log('Excluindo vistoria:', selectedInspection.id);
      setIsDeleteModalOpen(false);
      setSelectedInspection(null);
    }
  };

  const canDelete = (status: InspectionStatus) => {
    return status === 'agendadas' || status === 'atribuidas';
  };

  const handleViewDetails = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setIsViewDetailsModalOpen(true);
  };

  const handleSubmitInspectionEdit = (data: InspectionFormData) => {
    if (!selectedInspection) return;

    // Criar um objeto de vistoria atualizado a partir dos dados do formulário
    let status = selectedInspection.status;

    // Se foi selecionado um vistoriador, atualizar o status para "atribuidas"
    if (data.inspectorId && data.inspectorId !== 'company' && data.inspectorId !== selectedInspection.inspector) {
      status = 'atribuidas';
    }

    const updatedInspection: Inspection = {
      ...selectedInspection,
      propertyCode: data.propertyId,
      address: data.address || selectedInspection.address,
      date: data.scheduledDate,
      time: data.scheduledTime,
      type: data.inspectionType === 'entrada' 
        ? 'Entrada' 
        : data.inspectionType === 'saida' 
          ? 'Saída' 
          : 'Periódica',
      status: status,
      inspector: data.inspectorId
    };

    // Atualizar a lista de vistorias
    const updatedInspections = inspections.map(item => 
      item.id === selectedInspection.id ? updatedInspection : item
    );
    setInspections(updatedInspections);
    localStorage.setItem('vistorias', JSON.stringify(updatedInspections));
    
    // Fechar o modal
    setIsViewDetailsModalOpen(false);
    setSelectedInspection(null);
    
    // Atualizar a aba ativa caso o status tenha mudado
    if (status !== selectedInspection.status) {
      setActiveInspectionTab(status as InspectionStatus);
    }
  };

  // Mock data para demonstração (substituir por dados reais)
  const mockInspections: Inspection[] = [
    {
      id: 1,
      company: 'Tech Field',
      inspector: 'João Silva',
      address: 'Rua das Inovações, 456',
      status: 'agendadas',
      date: '26/03/2024',
      propertyCode: 'TF001',
      time: '10:00',
      type: 'Residencial'
    },
    {
      id: 2,
      company: 'Tank Field Cinco',
      inspector: 'Maria Santos',
      address: 'Av. da Tecnologia, 789',
      status: 'finalizadas',
      date: '24/03/2024',
      propertyCode: 'TF5002',
      time: '14:30',
      type: 'Comercial'
    },
    {
      id: 3,
      company: 'Imob Premium',
      inspector: 'Pedro Costa',
      address: 'Rua das Flores, 123',
      status: 'finalizadas',
      date: '24/03/2024',
      propertyCode: '',
      time: '',
      type: ''
    },
    {
      id: 4,
      company: 'Imob Plus',
      inspector: 'Ana Oliveira',
      address: 'Av. Principal, 456',
      status: 'agendadas',
      date: '25/03/2024',
      propertyCode: '',
      time: '',
      type: ''
    },
    {
      id: 5,
      company: 'Imob Master',
      inspector: 'Carlos Souza',
      address: 'Rua do Comércio, 789',
      status: 'atrasadas',
      date: '23/03/2024',
      propertyCode: '',
      time: '',
      type: ''
    },
    {
      id: 6,
      company: 'Imob Elite',
      inspector: 'Rafael Lima',
      address: 'Av. das Palmeiras, 321',
      status: 'andamento',
      date: '25/03/2024',
      propertyCode: '',
      time: '',
      type: ''
    },
    {
      id: 7,
      company: 'Imob Prime',
      inspector: 'Mariana Costa',
      address: 'Rua dos Ipês, 567',
      status: 'liberadas',
      date: '25/03/2024',
      propertyCode: '',
      time: '',
      type: ''
    }
  ];

  const handleGenerateReport = () => {
    // Implementação básica de geração de relatório
    const filteredData = mockInspections.filter(inspection => {
      const matchRealEstate = !filterRealEstate || inspection.company === filterRealEstate;
      const matchStatus = !filterStatus || inspection.status === filterStatus;
      const matchInspector = !filterInspector || inspection.inspector === filterInspector;
      const matchSearchTerm = !filterSearchTerm || 
        inspection.address.toLowerCase().includes(filterSearchTerm.toLowerCase());

      return matchRealEstate && matchStatus && matchInspector && matchSearchTerm;
    });

    // Aqui você pode implementar a lógica real de geração de relatório
    console.log('Relatório gerado:', filteredData);
    // Exemplo: Pode ser uma chamada para uma API de geração de relatório
    // ou download direto de um arquivo
  };

  const renderContent = () => {
    switch (activeItem.toLowerCase()) {
      case 'imobiliárias':
        return <RealEstateList />;
      case 'vistoriadores':
        return <InspectorsList />;
      case 'imóveis':
        return <PropertyList />;
      case 'vistorias':
        return (
          <div className="space-y-6">
            <InspectionsTabBar
              activeTab={activeInspectionTab}
              onTabChange={setActiveInspectionTab}
              onAddInspection={handleAddInspection}
            />
            <InspectionsList 
              status={activeInspectionTab} 
              onViewDetails={handleViewDetails}
            />
            <InspectionModal
              isOpen={isInspectionModalOpen}
              onClose={() => setIsInspectionModalOpen(false)}
              onSubmit={handleSubmitInspection}
            />
          </div>
        );
      case 'configurações':
        return <SettingsManager />;
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Card - Total de Imobiliárias */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 md:w-6 h-5 md:h-6 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                    <ArrowUpRight className="w-4 h-4" />
                    12.5%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">152</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm">Imobiliárias Ativas</p>
                    <span className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      +8 novas
                    </span>
                  </div>
                </div>
              </div>

              {/* Card - Total de Vistoriadores */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 md:w-6 h-5 md:h-6 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                    <ArrowUpRight className="w-4 h-4" />
                    8.2%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">48</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm">Vistoriadores Ativos</p>
                    <span className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      +3 novos
                    </span>
                  </div>
                </div>
              </div>

              {/* Card - Total de Imóveis */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Home className="w-5 md:w-6 h-5 md:h-6 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                    <ArrowUpRight className="w-4 h-4" />
                    15.3%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">1.247</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm">Imóveis Cadastrados</p>
                    <span className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      +25 novos
                    </span>
                  </div>
                </div>
              </div>

              {/* Card - Vistorias Agendadas */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-5 md:w-6 h-5 md:h-6 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-red-500">
                    <ArrowDownRight className="w-4 h-4" />
                    3.8%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">32</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm">Vistorias Agendadas</p>
                    <span className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      Hoje
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="overflow-x-auto">
              <Charts />
            </div>

            {/* Tabela de Vistorias Recentes */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Vistorias Recentes</h2>
                  <p className="text-sm text-gray-600">Últimas vistorias registradas no sistema</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleGenerateReport}
                    className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-2 border border-primary/30 px-3 py-2 rounded-md"
                  >
                    <FileText className="w-4 h-4" />
                    Gerar Relatório
                  </button>
                  <button 
                    onClick={() => setActiveItem('vistorias')}
                    className="text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    Ver todas
                  </button>
                </div>
              </div>
              
              {/* Filtros da Tabela */}
              <div className="p-4 md:p-6 border-b border-border bg-white/50 backdrop-blur-sm">
                <div className="flex gap-3 items-center mb-4">
                  {/* Barra de Busca Principal */}
                  <div className="relative flex-1 max-w-xl">
                    <input 
                      type="text"
                      placeholder="Buscar por endereço..."
                      value={filterSearchTerm}
                      onChange={(e) => setFilterSearchTerm(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>

                  {/* Botão de Filtros */}
                  <div className="relative group">
                    <button 
                      className={`h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2 text-sm text-gray-700 hover:border-primary/30 hover:bg-primary/5 transition-all ${
                        (filterRealEstate || filterStatus || filterInspector || filterStartDate || filterEndDate) ? 'border-primary text-primary' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Filtros
                        {(filterRealEstate || filterStatus || filterInspector || filterStartDate || filterEndDate) && (
                          <span className="w-5 h-5 flex items-center justify-center bg-primary text-white text-xs font-medium rounded-full">
                            {[filterRealEstate, filterStatus, filterInspector, (filterStartDate || filterEndDate)].filter(Boolean).length}
                          </span>
                        )}
                      </span>
                    </button>

                    {/* Popover de Filtros */}
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
                          {(filterRealEstate || filterStatus || filterInspector || filterStartDate || filterEndDate) && (
                            <button 
                              onClick={() => {
                                setFilterRealEstate('');
                                setFilterStatus('');
                                setFilterInspector('');
                                setFilterStartDate('');
                                setFilterEndDate('');
                              }}
                              className="text-xs text-red-600 hover:text-red-700 transition-colors"
                            >
                              Limpar Filtros
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Filtro de Imobiliária */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Imobiliária</label>
                            <select 
                              value={filterRealEstate}
                              onChange={(e) => setFilterRealEstate(e.target.value)}
                              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                            >
                              <option value="">Todas Imobiliárias</option>
                              <option value="Tech Field">Tech Field</option>
                              <option value="Tank Field Cinco">Tank Field Cinco</option>
                              {Array.from(new Set(mockInspections.map(i => i.company)))
                                .filter(company => !['Tech Field', 'Tank Field Cinco'].includes(company))
                                .map(estate => (
                                  <option key={estate} value={estate}>{estate}</option>
                                ))
                              }
                            </select>
                          </div>

                          {/* Filtro de Status */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <select 
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value as InspectionStatus)}
                              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                            >
                              <option value="">Todos Status</option>
                              <option value="agendadas">Agendadas</option>
                              <option value="finalizadas">Concluídas</option>
                              <option value="atrasadas">Atrasadas</option>
                              <option value="andamento">Em Andamento</option>
                              <option value="liberadas">Liberadas</option>
                            </select>
                          </div>

                          {/* Filtro de Vistoriador */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Vistoriador</label>
                            <select 
                              value={filterInspector}
                              onChange={(e) => setFilterInspector(e.target.value)}
                              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                            >
                              <option value="">Todos Vistoriadores</option>
                              {Array.from(new Set(mockInspections.map(i => i.inspector))).map(inspector => (
                                <option key={inspector} value={inspector}>{inspector}</option>
                              ))}
                            </select>
                          </div>

                          {/* Filtros de Data */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Período</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="date"
                                  value={filterStartDate}
                                  onChange={(e) => setFilterStartDate(e.target.value)}
                                  className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                                />
                              </div>
                              <div>
                                <input
                                  type="date"
                                  value={filterEndDate}
                                  onChange={(e) => setFilterEndDate(e.target.value)}
                                  className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chips de Filtros Ativos */}
                {(filterRealEstate || filterStatus || filterInspector || filterStartDate || filterEndDate) && (
                  <div className="flex flex-wrap gap-2">
                    {filterRealEstate && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">
                        <Building2 className="w-3 h-3" />
                        {filterRealEstate}
                      </span>
                    )}
                    {filterStatus && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                      </span>
                    )}
                    {filterInspector && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">
                        <Users className="w-3 h-3" />
                        {filterInspector}
                      </span>
                    )}
                    {(filterStartDate || filterEndDate) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">
                        <Calendar className="w-3 h-3" />
                        {filterStartDate && filterEndDate ? `${filterStartDate} - ${filterEndDate}` : 
                         filterStartDate ? `A partir de ${filterStartDate}` : 
                         `Até ${filterEndDate}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Código Vistoria
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Imobiliária
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vistoriador
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Endereço
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Tipo
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockInspections
                      .filter(inspection => {
                        const matchRealEstate = !filterRealEstate || inspection.company === filterRealEstate;
                        const matchStatus = !filterStatus || inspection.status === filterStatus;
                        const matchInspector = !filterInspector || inspection.inspector === filterInspector;
                        const matchSearchTerm = !filterSearchTerm || 
                          inspection.address.toLowerCase().includes(filterSearchTerm.toLowerCase());
                        const inspectionDate = new Date(inspection.date.split('/').reverse().join('-'));
                        const matchStartDate = !filterStartDate || inspectionDate >= new Date(filterStartDate);
                        const matchEndDate = !filterEndDate || inspectionDate <= new Date(filterEndDate);

                        return matchRealEstate && matchStatus && matchInspector && matchSearchTerm;
                      })
                      .map(inspection => (
                        <tr key={inspection.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 md:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                            {inspection.sequentialCode || 'N/A'}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{inspection.company}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {inspection.inspector?.split(' ').map(n => n[0]).join('') || ''}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">{inspection.inspector || ''}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                            {inspection.address}
                          </td>
                          <td className="px-4 md:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                            {inspection.type || 'N/A'}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium 
                              ${inspection.status === 'finalizadas' ? 'bg-green-50 text-green-700' : 
                              inspection.status === 'agendadas' ? 'bg-yellow-50 text-yellow-700' : 
                              inspection.status === 'atrasadas' ? 'bg-red-50 text-red-700' : 
                              'bg-primary/10 text-primary'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full 
                                ${inspection.status === 'finalizadas' ? 'bg-green-500' : 
                                inspection.status === 'agendadas' ? 'bg-yellow-500' : 
                                inspection.status === 'atrasadas' ? 'bg-red-500' : 
                                'bg-primary'}`}></span>
                              {inspection.status ? 
                                (inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)) : 
                                'Sem status'
                              }
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                            <span className="text-sm text-gray-600">{inspection.date}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuItemClick={setActiveItem}
        activeItem={activeItem.toLowerCase()}
      />
      <ClientHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />

      <main className="pl-0 md:pl-20 lg:pl-64 pt-16 transition-all duration-300">
        <div className="p-4 md:p-6 space-y-6">
          {renderContent()}
        </div>
      </main>

      {/* Modal de Adicionar Vistoria */}
      <InspectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitInspection}
      />

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

      {/* Modal de Detalhes da Vistoria */}
      <InspectionModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => {
          setIsViewDetailsModalOpen(false);
          setSelectedInspection(null);
        }}
        onSubmit={handleSubmitInspectionEdit}
        initialData={selectedInspection}
        title="Detalhes da Vistoria"
      />
    </div>
  );
}
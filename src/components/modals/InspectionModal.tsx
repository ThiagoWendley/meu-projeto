'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Upload, FileText, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import PropertyModal, { PropertyFormData } from './PropertyModal';
import { Inspection } from '@/types/inspection';

export interface InspectionFormData {
  propertyId: string;
  realEstateId?: string; // Opcional, só aparece para gestor
  inspectorId: string;
  inspectionType: 'entrada' | 'saida' | 'periodica';
  entryInspectionCode?: string; // Obrigatório apenas para vistoria de saída
  furnishingType: 'vazio' | 'semi_mobiliado' | 'mobiliado' | 'super_mobiliado';
  scheduledDate: string;
  scheduledTime: string;
  additionalInfo: string;
  document?: File;
  status?: 'agendadas' | 'atribuidas';
  address?: string; // Endereço do imóvel
  involvedParties: Array<{
    type: string;
    name: string;
    phone: string;
    email: string;
    document: string;
  }>;
  sequentialCode?: string; // Código sequencial único da vistoria
}

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InspectionFormData) => void;
  isManager?: boolean; // Para identificar se é gestor ou imobiliária
  initialData?: Inspection | null; // Dados iniciais para edição
  title?: string; // Título personalizado do modal
  readOnly?: boolean; // Modo somente leitura, sem edição permitida
  submitButtonText?: string; // Texto personalizado para o botão de submissão
}

export default function InspectionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isManager = false,
  initialData = null,
  title = 'Nova Vistoria',
  readOnly = false,
  submitButtonText = 'Agendar Vistoria'
}: InspectionModalProps) {
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [formData, setFormData] = useState<InspectionFormData>({
    propertyId: '',
    realEstateId: '',
    inspectorId: '',
    inspectionType: 'entrada',
    furnishingType: 'vazio',
    scheduledDate: '',
    scheduledTime: '',
    additionalInfo: '',
    involvedParties: []
  });
  const [originalData, setOriginalData] = useState<InspectionFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newInvolvedPartyType, setNewInvolvedPartyType] = useState('');
  const [involvedPartyTypes, setInvolvedPartyTypes] = useState([
    'Locador', 'Locatário', 'Fiador', 'Testemunha'
  ]);
  const [showNewType, setShowNewType] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PropertyFormData[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Detectar mudanças nos dados do formulário
  useEffect(() => {
    if (originalData) {
      // Comparar os dados atuais com os originais
      const isDifferent = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(isDifferent);
    }
  }, [formData, originalData]);

  // Atualizar o estado inicial quando o modal é aberto
  useEffect(() => {
    if (initialData) {
      const data: InspectionFormData = {
        propertyId: initialData.propertyCode || '',
        realEstateId: '',
        inspectorId: initialData.inspector || '',
        inspectionType: (initialData.type?.toLowerCase() as 'entrada' | 'saida' | 'periodica') || 'entrada',
        furnishingType: 'vazio',
        scheduledDate: initialData.date || '',
        scheduledTime: initialData.time || '',
        additionalInfo: '',
        involvedParties: []
      };
      setFormData(data);
      setPropertySearchQuery(initialData.propertyCode || '');
      // Armazenar os dados originais para comparação
      setOriginalData(data);
      setHasChanges(false);
    } else {
      // Reset para os valores padrão se não houver dados iniciais
      setFormData({
        propertyId: '',
        realEstateId: '',
        inspectorId: '',
        inspectionType: 'entrada',
        furnishingType: 'vazio',
        scheduledDate: '',
        scheduledTime: '',
        additionalInfo: '',
        involvedParties: []
      });
      setPropertySearchQuery('');
      setOriginalData(null);
      setHasChanges(false);
    }
  }, [initialData, isOpen]);

  // Funções para formatação
  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const phoneDigits = value.replace(/\D/g, '');
    
    // Verifica se é celular (com 9 dígitos após DDD) ou fixo (8 dígitos após DDD)
    if (phoneDigits.length <= 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      if (phoneDigits.length <= 2) {
        return phoneDigits;
      } else if (phoneDigits.length <= 6) {
        return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2)}`;
      } else {
        return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 6)}-${phoneDigits.slice(6, 10)}`;
      }
    } else {
      // Celular: (XX) 9XXXX-XXXX
      if (phoneDigits.length <= 2) {
        return phoneDigits;
      } else if (phoneDigits.length <= 7) {
        return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2)}`;
      } else {
        return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7, 11)}`;
      }
    }
  };

  const formatDocument = (value: string) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Verifica se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (digits.length <= 11) {
      // CPF: XXX.XXX.XXX-XX
      if (digits.length <= 3) {
        return digits;
      } else if (digits.length <= 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      } else if (digits.length <= 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      } else {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
      }
    } else {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      if (digits.length <= 2) {
        return digits;
      } else if (digits.length <= 5) {
        return `${digits.slice(0, 2)}.${digits.slice(2)}`;
      } else if (digits.length <= 8) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
      } else if (digits.length <= 12) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
      } else {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
      }
    }
  };

  // Mock data - em produção viria da API
  const realEstates = [
    { id: '1', name: 'Imobiliária A' },
    { id: '2', name: 'Imobiliária B' }
  ];

  const inspectors = [
    { id: 'company', name: 'Tah visto vistorias' },
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' }
  ];

  // Buscar imóveis cadastrados
  const fetchProperties = () => {
    try {
      const propertiesData = localStorage.getItem('properties');
      if (propertiesData) {
        return JSON.parse(propertiesData) as PropertyFormData[];
      }
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
    }
    return [];
  };

  // Função para buscar imóveis enquanto o usuário digita
  const handlePropertySearch = (query: string) => {
    setPropertySearchQuery(query);
    setFormData({...formData, propertyId: query});
    
    if (query.length > 1) {
      const properties = fetchProperties();
      const results = properties.filter((property: PropertyFormData) => 
        property.code.toLowerCase().includes(query.toLowerCase()) ||
        property.address.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Selecionar um imóvel da lista de resultados
  const handleSelectProperty = (property: PropertyFormData) => {
    setFormData({
      ...formData, 
      propertyId: property.code,
      address: `${property.address}, ${property.number} - ${property.neighborhood}, ${property.city}/${property.state}`
    });
    setPropertySearchQuery(property.code);
    setShowSearchResults(false);
    setFormErrors({...formErrors, propertyId: ''});
  };

  const handleNewProperty = () => {
    setShowPropertyModal(true);
  };

  const handlePropertySaved = (propertyData: PropertyFormData) => {
    setShowPropertyModal(false);
    setFormData({
      ...formData, 
      propertyId: propertyData.code,
      address: `${propertyData.address}, ${propertyData.number} - ${propertyData.neighborhood}, ${propertyData.city}/${propertyData.state}`
    });
    setPropertySearchQuery(propertyData.code);
    setFormErrors({...formErrors, propertyId: ''});
  };

  const handleAddInvolvedParty = () => {
    setFormData(prev => ({
      ...prev,
      involvedParties: [
        ...prev.involvedParties,
        { type: '', name: '', phone: '', email: '', document: '' }
      ]
    }));
  };

  const handleAddNewPartyType = () => {
    if (newInvolvedPartyType) {
      setInvolvedPartyTypes(prev => [...prev, newInvolvedPartyType]);
      setNewInvolvedPartyType('');
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validar campos obrigatórios
    if (!formData.propertyId.trim()) {
      errors.propertyId = 'Campo obrigatório';
    }
    
    if (!formData.scheduledDate.trim()) {
      errors.scheduledDate = 'Campo obrigatório';
    }
    
    if (!formData.scheduledTime.trim()) {
      errors.scheduledTime = 'Campo obrigatório';
    }
    
    if (formData.inspectionType === 'saida' && !formData.entryInspectionCode?.trim()) {
      errors.entryInspectionCode = 'Campo obrigatório para vistoria de saída';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateSequentialCode = () => {
    // Pegar as vistorias existentes do localStorage
    let sequentialCode = '001'; // Código padrão para o primeiro agendamento
    
    try {
      const storedInspections = localStorage.getItem('vistorias');
      if (storedInspections) {
        const inspections = JSON.parse(storedInspections) as Inspection[];
        
        if (inspections.length > 0) {
          // Filtrar apenas os códigos válidos e convertê-los para números
          const codes = inspections
            .map(insp => insp.sequentialCode || '')
            .filter(code => /^\d+$/.test(code))
            .map(code => parseInt(code, 10));
          
          if (codes.length > 0) {
            // Encontrar o maior código e adicionar 1
            const maxCode = Math.max(...codes);
            sequentialCode = (maxCode + 1).toString().padStart(3, '0');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao gerar código sequencial:', error);
    }
    
    return sequentialCode;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    // Gerar código sequencial da vistoria
    const sequentialCode = generateSequentialCode();
    
    const finalData = {
      ...formData,
      sequentialCode
    };
    
    onSubmit(finalData);
    onClose();
  };

  // Determinar o texto do botão com base nas mudanças
  const getSubmitButtonText = () => {
    if (!initialData) {
      return 'Agendar Vistoria';
    }
    
    if (hasChanges) {
      return 'Salvar alterações';
    }
    
    // Se não houver alterações, manter o texto original
    return submitButtonText;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-3xl max-h-[90vh] overflow-auto z-[9999]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Código do Imóvel */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Nome/Código do Imóvel <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className={`w-full p-2 border ${formErrors.propertyId ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    placeholder="Busque pelo código ou nome do imóvel"
                    value={propertySearchQuery}
                    onChange={(e) => handlePropertySearch(e.target.value)}
                    disabled={readOnly}
                  />
                  <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                      {searchResults.map((property, index) => (
                        <div 
                          key={index} 
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectProperty(property)}
                        >
                          <div className="font-medium">{property.code}</div>
                          <div className="text-sm text-gray-600">
                            {property.address}, {property.number} - {property.neighborhood}, {property.city}/{property.state}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showSearchResults && searchResults.length === 0 && propertySearchQuery.length > 1 && (
                    <div className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 p-2 z-10">
                      <p className="text-sm text-gray-600">Nenhum imóvel encontrado</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center"
                  onClick={handleNewProperty}
                  disabled={readOnly}
                >
                  <Plus size={18} className="mr-1" />
                  Novo Imóvel
                </button>
              </div>
              {formErrors.propertyId && (
                <p className="text-red-500 text-xs mt-1">{formErrors.propertyId}</p>
            )}
            </div>

              {/* Imobiliária - apenas para gestor */}
              {isManager && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imobiliária
                  </label>
                  <select
                    value={formData.realEstateId}
                    onChange={(e) => setFormData(prev => ({ ...prev, realEstateId: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                    disabled={readOnly}
                  >
                    <option value="">Selecione uma imobiliária</option>
                    {realEstates.map(re => (
                      <option key={re.id} value={re.id}>{re.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vistoriador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vistoriador
                </label>
                <select
                  value={formData.inspectorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspectorId: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                  disabled={readOnly}
                >
                  <option value="">Selecione um vistoriador</option>
                  {inspectors.map(inspector => (
                    <option key={inspector.id} value={inspector.id}>{inspector.name}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de Vistoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vistoria
                </label>
                <select
                  value={formData.inspectionType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    inspectionType: e.target.value as 'entrada' | 'saida' | 'periodica',
                    entryInspectionCode: e.target.value === 'saida' ? prev.entryInspectionCode : undefined
                  }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                  disabled={readOnly}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="periodica">Periódica</option>
                </select>
              </div>

              {/* Código da Vistoria de Entrada - apenas para vistoria de saída */}
              {formData.inspectionType === 'saida' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código da Vistoria de Entrada
                  </label>
                  <input
                    type="text"
                    value={formData.entryInspectionCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, entryInspectionCode: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                    placeholder="Digite o código da vistoria de entrada"
                    disabled={readOnly}
                  />
                </div>
              )}

              {/* Tipo de Mobília */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mobília
                </label>
                <select
                  value={formData.furnishingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, furnishingType: e.target.value as 'vazio' | 'semi_mobiliado' | 'mobiliado' | 'super_mobiliado' }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                  disabled={readOnly}
                >
                  <option value="vazio">Vazio</option>
                  <option value="semi_mobiliado">Semi Mobiliado</option>
                  <option value="mobiliado">Mobiliado</option>
                  <option value="super_mobiliado">Super Mobiliado</option>
                </select>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                    disabled={readOnly}
                  />
                </div>
              </div>

              {/* Informações Adicionais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informações Adicionais
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                  placeholder="Informações adicionais sobre a vistoria..."
                  disabled={readOnly}
                />
              </div>

              {/* Upload de Documento */}
              {!readOnly && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anexar Documento
                  </label>
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 hover:border-primary/30 rounded-lg transition-colors">
                    <div className="space-y-2 text-center">
                      <Upload className="w-6 h-6 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-500">
                        Arraste um arquivo ou <span className="text-primary">escolha um arquivo</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        PDF, DOCX, JPG ou PNG (máx. 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Envolvidos no Contrato */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Envolvidos no Contrato
                  </label>
                  {!readOnly && (
                    <button
                      onClick={handleAddInvolvedParty}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar pessoa
                    </button>
                  )}
                </div>
                
                {formData.involvedParties.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Nenhuma pessoa envolvida adicionada</p>
                    {!readOnly && (
                      <p className="text-xs text-gray-400 mt-1">
                        Clique em "Adicionar pessoa" para incluir locadores, locatários, etc.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.involvedParties.map((party, index) => (
                      <div 
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 bg-white space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Pessoa {index + 1}</h4>
                          {!readOnly && (
                            <button
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  involvedParties: prev.involvedParties.filter((_, i) => i !== index)
                                }));
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tipo
                            </label>
                            <div className="flex items-center gap-2">
                              {!showNewType ? (
                                <>
                                  <select
                                    value={party.type}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      setFormData(prev => ({
                                        ...prev,
                                        involvedParties: prev.involvedParties.map((p, i) => 
                                          i === index ? { ...p, type: newValue } : p
                                        )
                                      }));
                                    }}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                                    disabled={readOnly}
                                  >
                                    <option value="">Selecione um tipo</option>
                                    {involvedPartyTypes.map((type) => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                  {!readOnly && (
                                    <button
                                      onClick={() => setShowNewType(true)}
                                      className="p-1 text-primary hover:text-primary-light transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <input
                                    type="text"
                                    value={newInvolvedPartyType}
                                    onChange={(e) => setNewInvolvedPartyType(e.target.value)}
                                    placeholder="Novo tipo..."
                                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                                    disabled={readOnly}
                                  />
                                  <button
                                    onClick={handleAddNewPartyType}
                                    className="p-1 text-primary hover:text-primary-light transition-colors"
                                    disabled={readOnly}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowNewType(false);
                                      setNewInvolvedPartyType('');
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={readOnly}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nome
                            </label>
                            <input
                              type="text"
                              value={party.name}
                              onChange={(e) => {
                                const newParties = [...formData.involvedParties];
                                newParties[index].name = e.target.value;
                                setFormData(prev => ({ ...prev, involvedParties: newParties }));
                              }}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              value={party.phone}
                              onChange={(e) => {
                                const newParties = [...formData.involvedParties];
                                newParties[index].phone = formatPhone(e.target.value);
                                setFormData(prev => ({ ...prev, involvedParties: newParties }));
                              }}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                              placeholder="(00) 00000-0000"
                              maxLength={16}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={party.email}
                              onChange={(e) => {
                                const newParties = [...formData.involvedParties];
                                newParties[index].email = e.target.value;
                                setFormData(prev => ({ ...prev, involvedParties: newParties }));
                              }}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              CPF/CNPJ
                            </label>
                            <input
                              type="text"
                              value={party.document}
                              onChange={(e) => {
                                const newParties = [...formData.involvedParties];
                                newParties[index].document = formatDocument(e.target.value);
                                setFormData(prev => ({ ...prev, involvedParties: newParties }));
                              }}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
                              placeholder="000.000.000-00 ou 00.000.000/0000-00"
                              maxLength={18}
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Botão de submissão */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={readOnly}
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {showPropertyModal && (
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onSubmit={handlePropertySaved}
      />
      )}
    </Dialog.Root>
  );
} 
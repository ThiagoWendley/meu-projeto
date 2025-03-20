'use client';

import { useState } from 'react';
import { Building2, MapPin, Home, Bed, Bath, Car, Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import { Property } from '@/types/property';
import DeleteConfirm from '../modals/DeleteConfirm';
import PropertyModal, { PropertyFormData } from '../modals/PropertyModal';
import { useRouter } from 'next/navigation';

// Mock data para demonstração
const mockProperties: Property[] = [
  {
    id: '1',
    codigo: 'IMV001',
    tipo: 'Residencial',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    area: 120,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    imobiliaria: {
      id: '1',
      nome: 'Imobiliária Premium'
    },
    status: 'Disponível',
    valor: 450000,
    dataRegistro: '2024-03-20',
    ultimaVistoria: '2024-03-15'
  },
  {
    id: '2',
    codigo: 'IMV002',
    tipo: 'Comercial',
    endereco: {
      cep: '04321-765',
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: 'Sala 1010',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    area: 80,
    quartos: 0,
    banheiros: 1,
    vagas: 1,
    imobiliaria: {
      id: '2',
      nome: 'Imobiliária Elite'
    },
    status: 'Alugado',
    valor: 8000,
    dataRegistro: '2024-02-15',
    ultimaVistoria: '2024-03-10'
  }
];

export default function PropertyList() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter(property => 
    property.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.endereco.logradouro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.imobiliaria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: PropertyFormData) => {
    // Converter os dados do formulário para o formato da propriedade
    const newProperty: Property = {
      id: String(properties.length + 1),
      codigo: data.code,
      tipo: data.type as any, // Usar tipagem mais flexível aqui
      endereco: {
        logradouro: data.address,
        numero: data.number,
        complemento: data.complement,
        bairro: data.neighborhood,
        cidade: data.city,
        estado: data.state,
        cep: data.cep
      },
      area: 0, // Valor padrão, ajustar conforme necessário
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      imobiliaria: {
        id: '1',
        nome: 'Imobiliária Padrão'
      },
      status: 'Disponível',
      valor: 0,
      dataRegistro: new Date().toISOString().split('T')[0],
      ultimaVistoria: ''
    };
    
    setProperties([...properties, newProperty]);
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: PropertyFormData) => {
    if (selectedProperty) {
      // Converter os dados do formulário para o formato da propriedade
      const updatedProperty: Property = {
        ...selectedProperty,
        codigo: data.code,
        tipo: data.type as any, // Usar tipagem mais flexível aqui
        endereco: {
          logradouro: data.address,
          numero: data.number,
          complemento: data.complement,
          bairro: data.neighborhood,
          cidade: data.city,
          estado: data.state,
          cep: data.cep
        }
      };
      
      setProperties(properties.map(p => p.id === selectedProperty.id ? updatedProperty : p));
      setIsAddModalOpen(false);
      setSelectedProperty(null);
    }
  };

  const handleDelete = () => {
    if (selectedProperty) {
      setProperties(properties.filter(p => p.id !== selectedProperty.id));
      setIsDeleteModalOpen(false);
      setSelectedProperty(null);
    }
  };

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'Disponível':
        return 'bg-green-50 text-green-700 border border-green-100';
      case 'Alugado':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Vendido':
        return 'bg-gray-50 text-gray-700 border border-gray-100';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imóveis</h1>
          <p className="text-gray-600">Gerencie os imóveis cadastrados</p>
        </div>
        <button 
          onClick={() => {
            setSelectedProperty(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por código, endereço ou imobiliária..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Lista de Imóveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow space-y-4 cursor-pointer"
            onClick={() => {
              router.push(`/dashboard/imobiliaria/imovel/${property.id}`);
            }}
          >
            {/* Cabeçalho do Card - Nome/Código e Status */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{property.codigo}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="space-y-3 py-3 border-t border-b border-border">
              {/* Tipo */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Tipo</span>
                  <p className="text-sm font-medium text-gray-900">{property.tipo}</p>
                </div>
              </div>

              {/* Imobiliária */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Imobiliária</span>
                  <p className="text-sm font-medium text-gray-900">{property.imobiliaria.nome}</p>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Endereço</span>
                  <p className="text-sm font-medium text-gray-900">
                    {property.endereco.logradouro}, {property.endereco.numero}
                    {property.endereco.complemento && ` - ${property.endereco.complemento}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {property.endereco.bairro} - {property.endereco.cidade}/{property.endereco.estado}
                  </p>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <Home className="w-4 h-4 text-gray-600 mb-1" />
                <span className="text-sm text-gray-900">{property.area}m²</span>
              </div>
              <div className="flex flex-col items-center">
                <Bed className="w-4 h-4 text-gray-600 mb-1" />
                <span className="text-sm text-gray-900">{property.quartos}</span>
              </div>
              <div className="flex flex-col items-center">
                <Bath className="w-4 h-4 text-gray-600 mb-1" />
                <span className="text-sm text-gray-900">{property.banheiros}</span>
              </div>
              <div className="flex flex-col items-center">
                <Car className="w-4 h-4 text-gray-600 mb-1" />
                <span className="text-sm text-gray-900">{property.vagas}</span>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium text-gray-900">
                  {property.valor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última Vistoria:</span>
                <span className="text-gray-900">
                  {property.ultimaVistoria 
                    ? new Date(property.ultimaVistoria).toLocaleDateString('pt-BR')
                    : 'Não realizada'}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique no botão redirecione para a página de detalhes
                  router.push(`/dashboard/imobiliaria/imovel/${property.id}`);
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique no botão redirecione para a página de detalhes
                  setSelectedProperty(property);
                  setIsAddModalOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique no botão redirecione para a página de detalhes
                  setSelectedProperty(property);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProperty(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Imóvel"
        description={`Tem certeza que deseja excluir o imóvel "${selectedProperty?.codigo}"? Esta ação não poderá ser desfeita.`}
      />

      {/* Modal de Adicionar/Editar */}
      {isAddModalOpen && (
        <PropertyModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedProperty(null);
          }}
          onSubmit={selectedProperty ? handleEdit : handleAdd}
        />
      )}
    </div>
  );
} 
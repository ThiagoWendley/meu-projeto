'use client';

import { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => void;
  initialData?: PropertyFormData; // Dados iniciais para edição
  isEditing?: boolean; // Indicar se está editando ou criando
}

export interface PropertyFormData {
  id?: string;
  code: string;
  type: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  description?: string;
  area?: string;
}

export default function PropertyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false 
}: PropertyModalProps) {
  const [formData, setFormData] = useState<PropertyFormData>(
    initialData || {
      code: '',
      type: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
      description: '',
      area: ''
    }
  );

  const handleSubmit = () => {
    if (isEditing) {
      // Se estiver editando, mantém o código do imóvel
      onSubmit(formData);
    } else {
      // Se estiver criando um novo, gera um código sequencial
      // Gerar um número sequencial para o código do imóvel
      let propertySequence = 1;
      
      // Verificar se já existem imóveis com este código no localStorage
      const existingProperties = localStorage.getItem('properties');
      if (existingProperties) {
        try {
          const properties = JSON.parse(existingProperties);
          
          // Filtrar imóveis com o mesmo código base
          const sameCodeProperties = properties.filter((p: PropertyFormData) => 
            p.code.startsWith(formData.code + '-')
          );
          
          if (sameCodeProperties.length > 0) {
            // Encontrar o maior número sequencial atual
            const sequences = sameCodeProperties.map((p: PropertyFormData) => {
              const sequenceStr = p.code.split('-').pop();
              return sequenceStr ? parseInt(sequenceStr, 10) : 0;
            });
            
            propertySequence = Math.max(...sequences) + 1;
          }
        } catch (error) {
          console.error('Erro ao processar imóveis existentes:', error);
        }
      }
      
      // Criar o código completo do imóvel (código base + sequencial)
      const fullPropertyCode = `${formData.code}-${propertySequence}`;
      
      // Criar objeto do imóvel com o código completo
      const propertyData = {
        ...formData,
        id: initialData?.id || Math.random().toString(),
        code: fullPropertyCode
      };
      
      // Salvar o novo imóvel no localStorage
      try {
        const properties = existingProperties ? JSON.parse(existingProperties) : [];
        properties.push(propertyData);
        localStorage.setItem('properties', JSON.stringify(properties));
      } catch (error) {
        console.error('Erro ao salvar imóvel:', error);
      }
      
      // Enviar dados para o componente pai
      onSubmit(propertyData);
    }
    onClose();
  };

  // Função para formatar o CEP no padrão 00000-000
  const formatCep = (cep: string) => {
    cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length > 5) {
      return `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
    }
    return cep;
  };

  const handleCepSearch = async (cep: string) => {
    // Remove caracteres não numéricos para fazer a busca
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Só faz a busca se tiver 8 dígitos
    if (cepNumerico.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[9999] max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Código e Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Imóvel
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: APT-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Imóvel
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="sala_comercial">Sala Comercial</option>
                    <option value="galpao">Galpão</option>
                  </select>
                </div>
              </div>

              {/* CEP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => {
                    // Aplica a máscara e atualiza o estado
                    const cepDigitado = e.target.value;
                    const cepFormatado = formatCep(cepDigitado);
                    
                    setFormData(prev => ({ ...prev, cep: cepFormatado }));
                    
                    // Busca o CEP quando tiver 8 dígitos numéricos
                    const cepNumerico = cepFormatado.replace(/\D/g, '');
                    if (cepNumerico.length === 8) {
                      handleCepSearch(cepNumerico);
                    }
                  }}
                  maxLength={9} // 8 dígitos + 1 hífen
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="00000-000"
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Rua, Avenida, etc..."
                />
              </div>

              {/* Número e Complemento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Apto, Sala, etc..."
                  />
                </div>
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área (m²)
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => {
                    // Permitir apenas números e um ponto decimal
                    const area = e.target.value.replace(/[^\d.]/g, '');
                    // Evitar múltiplos pontos decimais
                    const formattedArea = area.split('.').length > 2 
                      ? area.substring(0, area.lastIndexOf('.'))
                      : area;
                    setFormData(prev => ({ ...prev, area: formattedArea }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: 75.5"
                />
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Informações adicionais sobre o imóvel..."
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
            >
              {isEditing ? 'Salvar' : 'Cadastrar Imóvel'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 
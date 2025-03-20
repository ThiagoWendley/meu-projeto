'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, X, Check, Trash2, Copy, Edit3, Camera, Home, GripVertical, MoreVertical, PlusCircle, Pencil, AlertTriangle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';

interface Foto {
  id: string;
  url: string;
  descricao?: string;
  referenciaEntradaId?: string;
}

interface Item {
  id: string;
  nome: string;
  tipo: string;
  ambiente?: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  fotos: Foto[];
  detalhes: any[];
  observacoes?: string;
}

interface Ambiente {
  id: string;
  nome: string;
  tipo: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  itens: Item[];
  fotos: Foto[];
  observacoes: string;
  ordem: number;
}

// Estrutura para armazenar dados da vistoria de entrada
interface VistoriaEntrada {
  ambientes: {
    [ambienteId: string]: {
      fotos: Foto[];
      observacoes: string;
    }
  };
}

// Estrutura para armazenar um template de ambiente
interface AmbienteTemplate {
  id: string;
  nome: string;
  tipo: string;
}

// Interface para o modal de novo ambiente
interface NovoAmbienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ambiente: Omit<Ambiente, 'id' | 'status' | 'itens' | 'fotos' | 'ordem'>) => void;
  initialData?: Omit<Ambiente, 'id' | 'status' | 'itens' | 'fotos' | 'ordem'>;
  title: string;
}

// Interface para o componente DiagonalImageCard
interface DiagonalImageCardProps {
  entradaImageUrl: string;
  saidaImageUrl?: string;
  entradaDescricao?: string;
  saidaDescricao?: string;
  entradaId: string;
  onAddSaidaImage: () => void;
  onViewImage: (imageUrl: string) => void;
  onDeleteSaidaImage?: (e: React.MouseEvent) => void;
}

// Interface para o modal de adicionar novo item
interface NovoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { nome: string; tipo: string }) => void;
}

// Interface para o template de item
interface ItemTemplate {
  id: string;
  nome: string;
  tipo: string;
}

// Componente do modal de novo ambiente
function NovoAmbienteModal({ isOpen, onClose, onAdd, initialData, title }: NovoAmbienteModalProps) {
  const [nomeAmbiente, setNomeAmbiente] = useState(initialData?.nome || '');
  const [tipoAmbiente, setTipoAmbiente] = useState(initialData?.tipo || '');
  const [novoTipo, setNovoTipo] = useState('');
  const [showNovoTipo, setShowNovoTipo] = useState(false);
  const [tiposAmbiente, setTiposAmbiente] = useState<string[]>([
    'Sala',
    'Cozinha',
    'Quarto',
    'Banheiro',
    'Lavabo',
    'Área de Serviço',
    'Varanda',
    'Escritório'
  ]);
  
  // Novos estados
  const [mostrarFormularioCriacao, setMostrarFormularioCriacao] = useState(false);
  const [ambientesTemplates, setAmbientesTemplates] = useState<AmbienteTemplate[]>([
    { id: '1', nome: 'Quarto 1', tipo: 'Quarto' },
    { id: '2', nome: 'Quarto 2', tipo: 'Quarto' },
    { id: '3', nome: 'Sala de Estar', tipo: 'Sala' },
    { id: '4', nome: 'Cozinha', tipo: 'Cozinha' },
    { id: '5', nome: 'Banheiro Social', tipo: 'Banheiro' },
  ]);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<string[]>([]);

  const handleAddTipo = () => {
    if (novoTipo.trim()) {
      setTiposAmbiente(prev => [...prev, novoTipo.trim()]);
      setTipoAmbiente(novoTipo.trim());
      setNovoTipo('');
      setShowNovoTipo(false);
    }
  };

  const handleSubmit = () => {
    if (nomeAmbiente.trim() && tipoAmbiente) {
      // Adicionar o ambiente criado
      onAdd({
        nome: nomeAmbiente.trim(),
        tipo: tipoAmbiente,
        observacoes: ''
      });
      
      // Adiciona o ambiente criado à lista de templates
      const novoTemplate: AmbienteTemplate = {
        id: Math.random().toString(),
        nome: nomeAmbiente.trim(),
        tipo: tipoAmbiente
      };
      
      setAmbientesTemplates(prev => [...prev, novoTemplate]);
      
      // Limpa os campos do formulário
      setNomeAmbiente('');
      setTipoAmbiente('');
      
      // Esconde o formulário de criação
      setMostrarFormularioCriacao(false);
      
      // Fecha o modal
      onClose();
    }
  };
  
  const toggleSelecaoAmbiente = (id: string) => {
    setAmbientesSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(ambId => ambId !== id) 
        : [...prev, id]
    );
  };
  
  const handleAdicionarAmbientesSelecionados = () => {
    // Adicionar todos os ambientes selecionados
    ambientesSelecionados.forEach(id => {
      const ambiente = ambientesTemplates.find(amb => amb.id === id);
      if (ambiente) {
        onAdd({
          nome: ambiente.nome,
          tipo: ambiente.tipo,
          observacoes: ''
        });
      }
    });
    
    // Limpa a seleção
    setAmbientesSelecionados([]);
    
    // Fecha o modal
    onClose();
  };

  // Nova função para excluir um ambiente template
  const handleExcluirAmbienteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique ative a seleção do ambiente
    setAmbientesTemplates(prev => prev.filter(amb => amb.id !== id));
    setAmbientesSelecionados(prev => prev.filter(ambId => ambId !== id));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[1101] p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          
          {/* Lista de ambientes disponíveis para seleção */}
          <div className="space-y-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700">Selecione ambientes para adicionar:</h3>
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {ambientesTemplates.map(ambiente => (
                <div 
                  key={ambiente.id}
                  onClick={() => toggleSelecaoAmbiente(ambiente.id)}
                  className={`flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    ambientesSelecionados.includes(ambiente.id) ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border ${
                      ambientesSelecionados.includes(ambiente.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {ambientesSelecionados.includes(ambiente.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{ambiente.nome}</span>
                      <span className="text-xs text-gray-500 ml-2">({ambiente.tipo})</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleExcluirAmbienteTemplate(ambiente.id, e)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Botão para exibir o formulário de criação */}
            <button
              onClick={() => setMostrarFormularioCriacao(prev => !prev)}
              className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar novo ambiente</span>
            </button>
            
            {/* Formulário de criação de ambiente */}
            {mostrarFormularioCriacao && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <div>
                  <label htmlFor="nome-ambiente" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Ambiente
                  </label>
                  <input
                    id="nome-ambiente"
                    type="text"
                    value={nomeAmbiente}
                    onChange={(e) => setNomeAmbiente(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: Sala de Estar"
                  />
                </div>
                
                <div>
                  <label htmlFor="tipo-ambiente" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Ambiente
                  </label>
                  {showNovoTipo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={novoTipo}
                        onChange={(e) => setNovoTipo(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Digite o novo tipo"
                      />
                      <button
                        onClick={handleAddTipo}
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        id="tipo-ambiente"
                        value={tipoAmbiente}
                        onChange={(e) => setTipoAmbiente(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Selecione um tipo</option>
                        {tiposAmbiente.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowNovoTipo(true)}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Adicionar novo tipo"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!nomeAmbiente.trim() || !tipoAmbiente}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleAdicionarAmbientesSelecionados}
              disabled={ambientesSelecionados.length === 0}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar {ambientesSelecionados.length} ambiente{ambientesSelecionados.length !== 1 ? 's' : ''}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Componente para exibir imagem em formato diagonal (entrada na diagonal superior, saída na diagonal inferior)
function DiagonalImageCard({ 
  entradaImageUrl, 
  saidaImageUrl, 
  onAddSaidaImage, 
  onViewImage, 
  onDeleteSaidaImage,
  entradaDescricao,
  saidaDescricao,
  entradaId
}: DiagonalImageCardProps) {
  
  return (
    <div className="aspect-square rounded-xl overflow-hidden border border-border bg-gray-50 relative">
      {/* Diagonal visual para mostrar a divisão */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute bg-gray-300" 
          style={{ 
            width: '142%', 
            height: '2px', 
            top: '50%', 
            left: '-20%', 
            transform: 'rotate(-45deg)', 
            transformOrigin: 'center',
            zIndex: 5
          }}
        ></div>
      </div>
      
      {/* Parte superior diagonal - Imagem da vistoria de entrada (referência) */}
      <div 
        className="absolute inset-0 cursor-pointer overflow-hidden z-0" 
        style={{ 
          clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' as any,
          WebkitClipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' as any
        }}
        onClick={() => onViewImage(entradaImageUrl)}
      >
        <div className="w-full h-full relative">
          <Image
            src={entradaImageUrl}
            alt={entradaDescricao || "Foto da vistoria de entrada"}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-md z-10">
            <span>Entrada</span>
          </div>
        </div>
      </div>
      
      {/* Parte inferior diagonal - Imagem da vistoria de saída ou botão para adicionar */}
      <div 
        className="absolute inset-0 overflow-hidden z-0" 
        style={{ 
          clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)',
          WebkitClipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)'
        }}
      >
        {saidaImageUrl ? (
          // Se já existe uma imagem de saída, mostra a imagem
          <div 
            className="w-full h-full cursor-pointer relative" 
            onClick={() => onViewImage(saidaImageUrl)}
          >
            <Image
              src={saidaImageUrl}
              alt={saidaDescricao || "Foto da vistoria de saída"}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-md z-10">
              <span>Saída</span>
            </div>
            
            {/* Botão de excluir */}
            {onDeleteSaidaImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSaidaImage(e);
                }}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-600 hover:bg-white transition-colors z-10"
                title="Excluir foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          // Se não existe imagem de saída, mostra botão para adicionar
          <button
            onClick={onAddSaidaImage}
            className="w-full h-full flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Camera className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500 font-medium">Adicionar</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Componente do modal de novo item
function NovoItemModal({ isOpen, onClose, onAdd }: NovoItemModalProps) {
  const [nomeItem, setNomeItem] = useState('');
  const [tipoItem, setTipoItem] = useState('');
  const [showNovoTipo, setShowNovoTipo] = useState(false);
  const [novoTipo, setNovoTipo] = useState('');
  const [tiposItem, setTiposItem] = useState([
    'Piso',
    'Parede',
    'Teto',
    'Porta',
    'Janela',
    'Tomada'
  ]);
  
  // Estados para os templates de itens
  const [mostrarFormularioCriacao, setMostrarFormularioCriacao] = useState(false);
  const [itensTemplates, setItensTemplates] = useState<ItemTemplate[]>([
    { id: '1', nome: 'Piso de Madeira', tipo: 'Piso' },
    { id: '2', nome: 'Parede com Pintura', tipo: 'Parede' },
    { id: '3', nome: 'Torneira', tipo: 'Hidráulica' },
    { id: '4', nome: 'Porta Principal', tipo: 'Porta' },
    { id: '5', nome: 'Janela de Vidro', tipo: 'Janela' },
  ]);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);

  const handleSubmit = () => {
    if (nomeItem.trim() && tipoItem) {
      // Adiciona o item criado à lista de templates
      const novoTemplate: ItemTemplate = {
        id: Math.random().toString(),
        nome: nomeItem.trim(),
        tipo: tipoItem
      };
      
      setItensTemplates(prev => [...prev, novoTemplate]);
      
      // Limpa os campos do formulário
      setNomeItem('');
      setTipoItem('');
      
      // Esconde o formulário de criação
      setMostrarFormularioCriacao(false);
    }
  };

  const handleAddTipo = () => {
    if (novoTipo.trim()) {
      setTiposItem(prev => [...prev, novoTipo.trim()]);
      setTipoItem(novoTipo.trim());
      setNovoTipo('');
      setShowNovoTipo(false);
    }
  };
  
  // Função para selecionar/deselecionar um item
  const toggleSelecaoItem = (id: string) => {
    setItensSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };
  
  // Função para adicionar os itens selecionados
  const handleAdicionarItensSelecionados = () => {
    // Adicionar todos os itens selecionados
    itensSelecionados.forEach(id => {
      const item = itensTemplates.find(item => item.id === id);
      if (item) {
        onAdd({
          nome: item.nome,
          tipo: item.tipo
        });
      }
    });
    
    // Limpa a seleção
    setItensSelecionados([]);
    
    // Fecha o modal
    onClose();
  };
  
  // Função para excluir um item template
  const handleExcluirItemTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique ative a seleção do item
    setItensTemplates(prev => prev.filter(item => item.id !== id));
    setItensSelecionados(prev => prev.filter(itemId => itemId !== id));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[1101] p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Adicionar Novo Item
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Selecione um ou mais itens pré-definidos:</h3>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {itensTemplates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelecaoItem(item.id)}
                    className={`p-3 rounded-lg border cursor-pointer relative ${
                      itensSelecionados.includes(item.id)
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.nome}</div>
                        <div className="text-xs text-gray-500">{item.tipo}</div>
                      </div>
                      <button
                        onClick={(e) => handleExcluirItemTemplate(item.id, e)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {itensSelecionados.includes(item.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Botão para exibir o formulário de criação */}
              <button
                onClick={() => setMostrarFormularioCriacao(prev => !prev)}
                className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>{mostrarFormularioCriacao ? 'Cancelar' : 'Criar novo item'}</span>
              </button>
            </div>
            
            {/* Formulário de criação de item (inicialmente oculto) */}
            {mostrarFormularioCriacao && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                <h3 className="text-sm font-medium text-gray-700">Criar novo item:</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Item
                  </label>
                  <input
                    type="text"
                    value={nomeItem}
                    onChange={(e) => setNomeItem(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: Piso da Sala"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo do Item
                  </label>
                  <div className="flex items-center gap-2">
                    {!showNovoTipo ? (
                      <>
                        <select
                          value={tipoItem}
                          onChange={(e) => setTipoItem(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Selecione um tipo</option>
                          {tiposItem.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowNovoTipo(true)}
                          className="p-2 text-primary hover:text-primary-light transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={novoTipo}
                          onChange={(e) => setNovoTipo(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Novo tipo de item"
                        />
                        <button
                          onClick={handleAddTipo}
                          className="p-2 text-primary hover:text-primary-light transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setShowNovoTipo(false);
                            setNovoTipo('');
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Botão para adicionar o item */}
                <button
                  onClick={handleSubmit}
                  disabled={!nomeItem.trim() || !tipoItem}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Adicionar Item
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarItensSelecionados}
                disabled={itensSelecionados.length === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar {itensSelecionados.length > 0 ? `(${itensSelecionados.length})` : ''}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Componente principal da página de ambientes de vistoria de saída
export default function AmbienteSaidaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [vistoriaId, setVistoriaId] = useState<string | null>(null);
  const [entryInspectionCode, setEntryInspectionCode] = useState<string | null>(null);
  
  // Estado para controlar a tab ativa (sempre presente na vistoria de saída)
  const [vistoriaTab, setVistoriaTab] = useState<'entrada' | 'saida'>('saida');
  
  // Estado para os ambientes
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<Ambiente | null>(null);
  const [showNovoAmbiente, setShowNovoAmbiente] = useState(false);
  const [ambienteParaEditar, setAmbienteParaEditar] = useState<Ambiente | null>(null);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAmbiente, setDraggedAmbiente] = useState<Ambiente | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para dados de vistoria de entrada
  const [vistoriaEntrada, setVistoriaEntrada] = useState<VistoriaEntrada>({
    ambientes: {}
  });
  
  // Dados mockados para a vistoria de entrada
  const vistoriaEntradaMock: VistoriaEntrada = {
    ambientes: {
      // Ambiente de exemplo para a vistoria de entrada
      'ambiente-default': {
        fotos: [
          {
            id: "entrada-foto-1",
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww",
            descricao: "Foto de entrada do ambiente"
          },
          {
            id: "entrada-foto-2",
            url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D",
            descricao: "Outro ângulo do ambiente - entrada"
          }
        ],
        observacoes: "Ambiente em bom estado na vistoria de entrada."
      }
    }
  };
  
  // Ambientes mockados para exemplo
  const ambientesMock: Ambiente[] = [
    {
      id: '1',
      nome: 'Sala de Estar',
      tipo: 'Sala',
      status: 'pendente',
      itens: [],
      fotos: [],
      observacoes: 'Sala de estar principal do apartamento',
      ordem: 1
    },
    {
      id: '2',
      nome: 'Quarto Principal',
      tipo: 'Quarto',
      status: 'pendente',
      itens: [],
      fotos: [],
      observacoes: 'Quarto principal com suíte',
      ordem: 2
    },
    {
      id: '3',
      nome: 'Cozinha',
      tipo: 'Cozinha',
      status: 'pendente',
      itens: [],
      fotos: [],
      observacoes: 'Cozinha com armários e bancada',
      ordem: 3
    }
  ];
  
  useEffect(() => {
    // Verificar se o parâmetro vistoriaId existe na URL
    const vistoriaIdParam = searchParams?.get('vistoriaId');
    
    if (!vistoriaIdParam) {
      // Se não existir, redirecionar para a página principal de vistorias
      router.push('/dashboard/vistoriador/capavistoriasaida');
      return;
    }
    
    // Armazenar o ID da vistoria e garantir que esteja no localStorage
    setVistoriaId(vistoriaIdParam);
    
    // Garantir que o vistoriaId esteja sempre no localStorage
    try {
      const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
      let vistoriaAtivaObj;
      
      if (vistoriaAtivaString) {
        vistoriaAtivaObj = JSON.parse(vistoriaAtivaString);
      } else {
        vistoriaAtivaObj = {};
      }
      
      // Atualizar ou adicionar o ID da vistoria
      vistoriaAtivaObj.id = vistoriaIdParam;
      if (!vistoriaAtivaObj.tipoVistoria) {
        vistoriaAtivaObj.tipoVistoria = 'saida';
      }
      
      // Salvar de volta no localStorage
      localStorage.setItem('vistoriaAtiva', JSON.stringify(vistoriaAtivaObj));
      console.log("AmbienteSaida - useEffect - Vistoria atualizada no localStorage:", vistoriaAtivaObj);
    } catch (error) {
      console.error('Erro ao atualizar vistoriaAtiva no localStorage:', error);
    }
    
    // Verificar informações sobre a vistoria de saída no localStorage
    try {
      const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
      if (vistoriaAtivaString) {
        const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
        if (vistoriaAtiva && vistoriaAtiva.tipoVistoria === 'saida') {
          if (vistoriaAtiva.entryInspectionCode) {
            setEntryInspectionCode(vistoriaAtiva.entryInspectionCode);
          } else {
            setEntryInspectionCode("VS-2023-001"); // Código de exemplo como fallback
          }
          
          // Simular carregamento dos dados de vistoria de entrada
          setVistoriaEntrada(vistoriaEntradaMock);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar vistoria ativa:', error);
    }
    
    // Carregar ambientes do localStorage ou usar o mock para demonstração
    try {
      const ambientesArmazenados = localStorage.getItem('ambientes');
      if (ambientesArmazenados) {
        const ambientesParsed = JSON.parse(ambientesArmazenados);
        setAmbientes(ambientesParsed);
        // Selecionar o primeiro ambiente automaticamente, se existir
        if (ambientesParsed.length > 0) {
          setAmbienteSelecionado(ambientesParsed[0]);
        }
      } else {
        // Usar dados de exemplo se não encontrar no localStorage
        setAmbientes(ambientesMock);
        // Selecionar o primeiro ambiente automaticamente, se existir
        if (ambientesMock.length > 0) {
          setAmbienteSelecionado(ambientesMock[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ambientes:', error);
      setAmbientes(ambientesMock); // Usar mock em caso de erro
      // Selecionar o primeiro ambiente automaticamente, se existir
      if (ambientesMock.length > 0) {
        setAmbienteSelecionado(ambientesMock[0]);
      }
    }
    
    setLoading(false);
  }, [router, searchParams]);
  
  // Função para voltar para a página de vistoria
  const handleVoltar = () => {
    const params = new URLSearchParams();
    
    // Verificar se temos um vistoriaId definido no estado
    if (vistoriaId) {
      params.append('vistoriaId', vistoriaId);
      router.push(`/dashboard/vistoriador/capavistoriasaida?${params.toString()}`);
    } else {
      // Se não tiver no estado, tenta buscar do localStorage
      try {
        const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
        if (vistoriaAtivaString) {
          const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
          if (vistoriaAtiva && vistoriaAtiva.id) {
            params.append('vistoriaId', vistoriaAtiva.id);
            router.push(`/dashboard/vistoriador/capavistoriasaida?${params.toString()}`);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao recuperar vistoriaAtiva do localStorage:', error);
      }
      
      // Se não conseguir recuperar o ID, voltar para a lista de vistorias
      router.push('/dashboard/vistoriador/capavistoriasaida');
    }
  };
  
  // Função para navegar para a página de item
  const handleItemClick = (ambiente: Ambiente, itemId: string) => {
    const params = new URLSearchParams();
    params.append('ambienteId', ambiente.id);
    params.append('itemId', itemId);
    if (vistoriaId) {
      params.append('vistoriaId', vistoriaId);
    }
    router.push(`/dashboard/vistoriador/itemsaida?${params.toString()}`);
  };
  
  // Funções para gerenciar ambientes
  const handleAddAmbiente = (novoAmbiente: Omit<Ambiente, 'id' | 'status' | 'itens' | 'fotos' | 'ordem'>) => {
    const ambiente: Ambiente = {
      id: Math.random().toString(),
      ...novoAmbiente,
      status: 'pendente',
      itens: [],
      fotos: [],
      ordem: ambientes.length
    };

    const ambientesAtualizados = [...ambientes, ambiente];
    setAmbientes(ambientesAtualizados);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
    
    // Notificar o usuário
    toast.success('Ambiente adicionado com sucesso!');
  };

  const handleExcluirAmbiente = (ambiente: Ambiente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique seja propagado para o card
    
    // Verificar se o ambiente está selecionado
    if (ambienteSelecionado?.id === ambiente.id) {
      setAmbienteSelecionado(null);
    }
    
    // Remover o ambiente da lista
    const ambientesAtualizados = ambientes.filter(amb => amb.id !== ambiente.id);
    setAmbientes(ambientesAtualizados);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
    
    // Notificar o usuário
    toast.success(`Ambiente ${ambiente.nome} excluído com sucesso!`);
  };

  const handleExcluirSelecionados = () => {
    // Verificar se há ambientes selecionados
    if (ambientesSelecionados.length === 0) return;
    
    // Verificar se o ambiente selecionado está na lista de selecionados
    if (ambienteSelecionado && ambientesSelecionados.includes(ambienteSelecionado.id)) {
      setAmbienteSelecionado(null);
    }
    
    // Remover os ambientes selecionados
    const ambientesAtualizados = ambientes.filter(amb => !ambientesSelecionados.includes(amb.id));
    setAmbientes(ambientesAtualizados);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
    
    // Notificar o usuário
    toast.success(`${ambientesSelecionados.length} ambiente(s) excluído(s) com sucesso!`);
    
    // Sair do modo de seleção
    setModoSelecao(false);
    setAmbientesSelecionados([]);
  };

  const handleDuplicarAmbiente = (ambiente: Ambiente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique seja propagado para o card
    
    // Criar uma cópia do ambiente
    const novoAmbiente = {
      ...ambiente,
      id: Math.random().toString(),
      nome: `${ambiente.nome} (Cópia)`,
      ordem: ambientes.length
    };
    
    // Adicionar o novo ambiente à lista
    const ambientesAtualizados = [...ambientes, novoAmbiente];
    setAmbientes(ambientesAtualizados);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
    
    // Notificar o usuário
    toast.success(`Ambiente ${ambiente.nome} duplicado com sucesso!`);
  };

  const handleEditarAmbiente = (ambiente: Ambiente) => {
    setAmbienteParaEditar(ambiente);
    setShowNovoAmbiente(true);
    setModoSelecao(false);
  };
  
  const handleEditarAmbienteClick = (ambiente: Ambiente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique seja propagado para o card
    handleEditarAmbiente(ambiente);
  };

  const handleDragStart = (ambiente: Ambiente) => {
    setDraggedAmbiente(ambiente);
    setIsDragging(true);
  };

  const handleDragOver = (targetAmbiente: Ambiente) => {
    if (!draggedAmbiente || draggedAmbiente.id === targetAmbiente.id) return;

    const newAmbientes = [...ambientes];
    const draggedIndex = newAmbientes.findIndex(amb => amb.id === draggedAmbiente.id);
    const targetIndex = newAmbientes.findIndex(amb => amb.id === targetAmbiente.id);
    
    const [removed] = newAmbientes.splice(draggedIndex, 1);
    newAmbientes.splice(targetIndex, 0, removed);
    
    const reordenados = newAmbientes.map((amb, index) => ({ ...amb, ordem: index }));
    setAmbientes(reordenados);
  };

  const handleDragEnd = () => {
    setDraggedAmbiente(null);
    setIsDragging(false);
  };
  
  const handleCardClick = (ambiente: Ambiente) => {
    if (modoSelecao) {
      toggleSelecaoAmbiente(ambiente.id);
    } else {
      setAmbienteSelecionado(ambiente);
    }
  };
  
  const toggleSelecaoAmbiente = (ambienteId: string) => {
    setAmbientesSelecionados(prev => 
      prev.includes(ambienteId)
        ? prev.filter(id => id !== ambienteId)
        : [...prev, ambienteId]
    );
  };
  
  const sairDoModoSelecao = () => {
    setModoSelecao(false);
    setAmbientesSelecionados([]);
  };
  
  const handleMouseDown = (ambiente: Ambiente) => {
    longPressTimerRef.current = setTimeout(() => {
      setModoSelecao(true);
      toggleSelecaoAmbiente(ambiente.id);
      longPressTimerRef.current = null;
    }, 500); // 500ms para considerar como pressão longa
  };
  
  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  const handleTouchStart = (ambiente: Ambiente) => {
    longPressTimerRef.current = setTimeout(() => {
      setModoSelecao(true);
      toggleSelecaoAmbiente(ambiente.id);
      longPressTimerRef.current = null;
    }, 500); // 500ms para considerar como pressão longa
  };
  
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  // Função para obter as fotos baseadas na tab selecionada (entrada/saída)
  const getFotosPorTab = () => {
    if (!ambienteSelecionado) return [];
    
    if (vistoriaTab === 'entrada') {
      // Para a aba Entrada em vistoria de saída, mostrar fotos da vistoria de entrada
      // Verificar se o ambiente existe na vistoria de entrada
      if (vistoriaEntrada.ambientes[ambienteSelecionado.id]) {
        return vistoriaEntrada.ambientes[ambienteSelecionado.id].fotos;
      } else {
        // Se não encontrar pelo ID exato, usar ambiente padrão como exemplo
        return vistoriaEntrada.ambientes['ambiente-default']?.fotos || [];
      }
    } else {
      // Para a aba Saída, mostrar fotos do ambiente atual
      return ambienteSelecionado.fotos;
    }
  };

  // Função para obter as observações baseadas na tab selecionada
  const getObservacoesPorTab = () => {
    if (!ambienteSelecionado) return '';
    
    if (vistoriaTab === 'entrada') {
      // Para a aba Entrada em vistoria de saída, mostrar observações da vistoria de entrada
      if (vistoriaEntrada.ambientes[ambienteSelecionado.id]) {
        return vistoriaEntrada.ambientes[ambienteSelecionado.id].observacoes;
      } else {
        // Se não encontrar, usar ambiente padrão como exemplo
        return vistoriaEntrada.ambientes['ambiente-default']?.observacoes || '';
      }
    } else {
      // Para a aba Saída, mostrar observações do ambiente atual
      return ambienteSelecionado.observacoes;
    }
  };
  
  // Estado para controlar qual botão de comparação está selecionado
  const [comparacaoSelecionada, setComparacaoSelecionada] = useState<'igual' | 'diferente' | null>(null);
  
  // Função para adicionar uma foto com referência à foto de entrada
  const handleAddFotoComReferencia = (entradaId: string, descricao?: string) => {
    if (!fileInputRef.current || !ambienteSelecionado) return;
    
    // Armazenar o ID da referência temporariamente no localStorage para recuperá-lo
    // após a seleção do arquivo
    localStorage.setItem('referenciaEntradaId', entradaId);
    
    // Abrir o seletor de arquivos
    fileInputRef.current.click();
  };
  
  const handleBlurObservacoes = () => {
    if (ambienteSelecionado) {
      // Salvar no localStorage sempre que sair do campo
      localStorage.setItem('ambientes', JSON.stringify(ambientes));
      
      // Feedback para o usuário (opcional)
      toast.success('Observações salvas com sucesso!');
    }
  };
  
  // Função para lidar com a seleção de botão de comparação
  const handleComparacaoClick = (tipo: 'igual' | 'diferente') => {
    setComparacaoSelecionada(tipo);
    
    // Salvar a seleção no ambiente atual
    if (ambienteSelecionado) {
      const ambienteAtualizado = {
        ...ambienteSelecionado,
        comparacaoEntradaSaida: tipo
      };
      
      const ambientesAtualizados = ambientes.map(amb => 
        amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
      );
      
      setAmbientes(ambientesAtualizados);
      setAmbienteSelecionado(ambienteAtualizado);
      
      // Salvar no localStorage
      localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
      
      // Notificação de sucesso
      toast.success(`Ambiente definido como: ${tipo === 'igual' ? 'Igual' : 'Diferente'} ao da vistoria de entrada`);
    }
  };
  
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [itensDoBanco, setItensDoBanco] = useState<Item[]>([]);
  const [itensDoAmbiente, setItensDoAmbiente] = useState<Item[]>([]);
  
  // Função para adicionar um novo item ao ambiente
  const handleAddItem = (novoItem: { nome: string; tipo: string }) => {
    if (!ambienteSelecionado) return;

    const item: Item = {
      id: Math.random().toString(),
      nome: novoItem.nome,
      tipo: novoItem.tipo,
      ambiente: ambienteSelecionado.id,
      status: 'pendente',
      fotos: [],
      detalhes: [],
      observacoes: ''
    };

    // Adicionar o item ao ambiente
    const ambienteAtualizado = {
      ...ambienteSelecionado,
      itens: [...ambienteSelecionado.itens, item]
    };

    const ambientesAtualizados = ambientes.map(amb => 
      amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
    );
    
    setAmbientes(ambientesAtualizados);
    setAmbienteSelecionado(ambienteAtualizado);

    // Salvar o item no localStorage para que apareça no sidebar direito
    const itensAtualizados = [...itensDoBanco, item];
    setItensDoBanco(itensAtualizados);
    localStorage.setItem('itens', JSON.stringify(itensAtualizados));
    
    // Notificar o usuário
    toast.success(`Item ${novoItem.nome} adicionado com sucesso!`);
  };
  
  // Atualizar o conteúdo do sidebar direito com itens do banco
  useEffect(() => {
    // Filtrar itens para o ambiente selecionado
    if (ambienteSelecionado && itensDoBanco.length > 0) {
      const itensFiltrados = itensDoBanco.filter(
        item => item.ambiente === ambienteSelecionado.id
      );
      setItensDoAmbiente(itensFiltrados);
    } else {
      setItensDoAmbiente([]);
    }
  }, [ambienteSelecionado, itensDoBanco]);
  
  // Função para carregar itens do localStorage
  useEffect(() => {
    try {
      const itensArmazenados = localStorage.getItem('itens');
      if (itensArmazenados) {
        const itensParsed = JSON.parse(itensArmazenados);
        setItensDoBanco(itensParsed);
      }
    } catch (error) {
      console.error('Erro ao carregar itens do localStorage:', error);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Lista de Ambientes (Sidebar Esquerda) */}
      <aside className="w-48 bg-white border-r border-border h-screen fixed left-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {modoSelecao ? "Ambientes" : "Ambientes"}
            </h2>
            {modoSelecao ? (
            <button
                onClick={sairDoModoSelecao}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Cancelar seleção"
              >
                <X className="w-5 h-5" />
            </button>
            ) : null}
          </div>
          
          {modoSelecao && ambientesSelecionados.length > 0 && (
            <button
              onClick={handleExcluirSelecionados}
              className="w-full mb-4 py-2 bg-red-50 text-red-500 rounded-lg transition-colors text-center text-sm"
            >
              Excluir {ambientesSelecionados.length} ambiente{ambientesSelecionados.length !== 1 ? 's' : ''}
            </button>
          )}
          
          <div className="space-y-2">
            {ambientes.sort((a, b) => a.ordem - b.ordem).map((ambiente) => (
              <div 
                key={ambiente.id}
                draggable={modoSelecao}
                onDragStart={() => handleDragStart(ambiente)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(ambiente);
                }}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(ambiente)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={() => handleMouseDown(ambiente)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => handleCardClick(ambiente)}
                className={`w-full p-3 rounded-lg text-left transition-colors relative ${
                  !modoSelecao && ambienteSelecionado?.id === ambiente.id
                    ? 'bg-white border-2 border-primary'
                    : ambientesSelecionados.includes(ambiente.id)
                    ? 'bg-blue-50 border border-blue-300'
                    : 'bg-white border border-gray-200'
                } ${!modoSelecao ? 'group' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{ambiente.nome}</h3>
                    <p className="text-xs text-gray-500">{ambiente.tipo}</p>
                </div>
                </div>
                
                {/* Ícones de ação que aparecem sempre */}
                {!modoSelecao && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleEditarAmbienteClick(ambiente, e)}
                      className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                      title="Editar ambiente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicarAmbiente(ambiente, e)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Duplicar ambiente"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleExcluirAmbiente(ambiente, e)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir ambiente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                )}
                
                {/* Ícones de ação que aparecem no modo de seleção */}
                {ambientesSelecionados.includes(ambiente.id) && modoSelecao && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditarAmbienteClick(ambiente, e)}
                      className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                      title="Editar ambiente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicarAmbiente(ambiente, e)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Duplicar ambiente"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleExcluirAmbiente(ambiente, e)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir ambiente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {ambientes.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Nenhum ambiente criado</p>
                <p className="text-xs text-gray-400 mt-1">Adicione um ambiente para edição</p>
          </div>
            )}
        </div>
        </div>

        {/* Botão Adicionar Ambiente */}
        <button
          onClick={() => {
            setAmbienteParaEditar(null);
            setShowNovoAmbiente(true);
          }}
          className="fixed bottom-6 left-6 w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 pl-48 pr-48">
        <header className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handleVoltar}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </button>
              <div className="flex flex-col items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  {ambienteSelecionado?.nome || 'Selecione um ambiente'}
                </h1>
              </div>
              <div>
                {/* Espaço reservado para botões de ação futuros */}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-6">
          {/* Tabs Entrada/Saída - Sempre exibida na tela de ambientesaida */}
          <div className="bg-white rounded-xl border border-border p-2">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setVistoriaTab('entrada')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    vistoriaTab === 'entrada'
                      ? 'bg-white text-primary shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Entrada
                </button>
                <button
                  onClick={() => setVistoriaTab('saida')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    vistoriaTab === 'saida'
                      ? 'bg-white text-primary shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Saída
                </button>
              </div>
            </div>

          {ambienteSelecionado ? (
            <>
              {/* Área de Fotos e Vídeos */}
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fotos e Vídeos</h2>
                  
                  {vistoriaTab === 'saida' && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  )}
                </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vistoriaTab === 'entrada' ? (
                    // Exibe fotos da vistoria de entrada para o ambiente selecionado
                    getFotosPorTab().map((foto) => (
                      <div 
                        key={foto.id}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-gray-50"
                      >
                        <button
                          onClick={() => setSelectedImage(foto.url)}
                          className="w-full h-full"
                        >
                          <Image
                          src={foto.url} 
                            alt={foto.descricao || ""}
                            fill
                            className="object-cover"
                          />
                        </button>
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-end p-2">
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <span className="text-sm text-white font-medium">
                              {foto.descricao || "Foto da vistoria de entrada"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Exibe fotos da vistoria de saída, incluindo as diagonais
                    <>
                      {/* Imagens de referência da entrada com suas respectivas imagens de saída (formato diagonal) */}
                      {vistoriaEntrada.ambientes['ambiente-default']?.fotos.map(fotoEntrada => {
                        // Procura se já existe uma foto de saída que referencia esta foto de entrada
                        const fotoSaida = ambienteSelecionado.fotos.find(
                          f => f.referenciaEntradaId === fotoEntrada.id
                        );
                        
                        return (
                          <DiagonalImageCard
                            key={`diagonal-${fotoEntrada.id}`}
                            entradaImageUrl={fotoEntrada.url}
                            saidaImageUrl={fotoSaida?.url}
                            entradaDescricao={fotoEntrada.descricao}
                            saidaDescricao={fotoSaida?.descricao}
                            entradaId={fotoEntrada.id}
                            onAddSaidaImage={() => handleAddFotoComReferencia(fotoEntrada.id, fotoEntrada.descricao || "Referência")}
                            onViewImage={(imageUrl) => setSelectedImage(imageUrl)}
                            onDeleteSaidaImage={fotoSaida ? (e) => {
                              e.stopPropagation();
                              const fotosAtualizadas = ambienteSelecionado.fotos.filter(f => f.id !== fotoSaida.id);
                              const ambienteAtualizado = { ...ambienteSelecionado, fotos: fotosAtualizadas };
                              const ambientesAtualizados = ambientes.map(amb => 
                                amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
                              );
                              setAmbientes(ambientesAtualizados);
                              setAmbienteSelecionado(ambienteAtualizado);
                              localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
                              toast.success('Foto removida com sucesso');
                            } : undefined}
                          />
                        );
                      })}

                      {/* Fotos sem referência - fotos normais da aba saída */}
                      {ambienteSelecionado.fotos.filter(foto => !foto.referenciaEntradaId).map(foto => (
                        <div
                          key={foto.id}
                          className="aspect-square rounded-xl overflow-hidden border border-border bg-gray-50 relative"
                        >
                          <button
                            onClick={() => setSelectedImage(foto.url)}
                            className="w-full h-full"
                          >
                            <Image
                              src={foto.url}
                              alt={foto.descricao || ""}
                              fill
                              className="object-cover"
                            />
                          </button>
                        
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remover a foto
                              const fotosAtualizadas = ambienteSelecionado.fotos.filter(f => f.id !== foto.id);
                              const ambienteAtualizado = { ...ambienteSelecionado, fotos: fotosAtualizadas };
                              const ambientesAtualizados = ambientes.map(amb => 
                                amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
                              );
                              setAmbientes(ambientesAtualizados);
                              setAmbienteSelecionado(ambienteAtualizado);
                              localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
                              toast.success('Foto removida com sucesso');
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-600 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Excluir foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                    ))}
                    
                      {/* Botão para adicionar novas fotos */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600"
                      >
                        <Camera className="w-6 h-6" />
                        <span className="text-sm font-medium">Adicionar Foto</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Observações do Ambiente */}
              <div className="bg-white rounded-xl border border-border p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações do Ambiente</h2>
                
                {vistoriaTab === 'entrada' ? (
                  // Mostrar texto somente leitura na aba "entrada"
                  <div className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 min-h-[100px]">
                    {getObservacoesPorTab()}
                  </div>
                ) : (
                  // Mostrar área de texto editável na aba "saída"
                  <textarea
                    value={ambienteSelecionado.observacoes || ''}
                    onChange={(e) => {
                      if (ambienteSelecionado) {
                        const ambienteAtualizado = {
                          ...ambienteSelecionado,
                          observacoes: e.target.value
                        };
                        
                        const ambientesAtualizados = ambientes.map(amb => 
                          amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
                        );
                        
                        setAmbientes(ambientesAtualizados);
                        setAmbienteSelecionado(ambienteAtualizado);
                      }
                    }}
                    onBlur={handleBlurObservacoes}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Adicione observações sobre este ambiente..."
                  />
                )}
                </div>

              {/* Botões de comparação - exibidos apenas na aba "saída" */}
              {vistoriaTab === 'saida' && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleComparacaoClick('igual')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm ${
                      comparacaoSelecionada === 'igual'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Igual da de entrada
                  </button>
                  <button
                    onClick={() => handleComparacaoClick('diferente')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm ${
                      comparacaoSelecionada === 'diferente'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Diferente da de entrada
                  </button>
              </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white rounded-xl border border-border p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ArrowLeft className="w-6 h-6 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Selecione um ambiente</h2>
              <p className="text-gray-500 max-w-md">
                Escolha um ambiente na barra lateral para visualizar seus detalhes.
              </p>
            </div>
          )}
        </main>
      </div>
      
      {/* Lista de Itens (Sidebar Direita) */}
      <aside className="w-48 bg-white border-l border-border h-screen fixed right-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Itens do Ambiente</h2>
          </div>
          
          {!ambienteSelecionado ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500">
              <p className="text-center text-xs">Selecione um ambiente para ver seus itens</p>
            </div>
          ) : (
            <>
                <div className="space-y-2">
                {itensDoAmbiente.map((item) => (
                  <button
                      key={item.id}
                    onClick={() => ambienteSelecionado && router.push(`/dashboard/vistoriador/itemsaida?itemId=${item.id}&ambienteId=${ambienteSelecionado.id}`)}
                    className="w-full p-3 rounded-lg border border-border hover:border-primary/30 transition-colors text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {item.fotos && item.fotos.length > 0 ? (
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.fotos[0].url}
                            alt={item.nome}
                            className="w-full h-full object-cover"
                          />
                      </div>
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Camera className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <span className="font-medium text-gray-900 text-sm block truncate">{item.nome}</span>
                        <span className="text-xs text-gray-500 block truncate">{item.tipo}</span>
                    </div>
                    </div>
                  </button>
                  ))}
                </div>
              {itensDoAmbiente.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <p className="text-sm text-gray-500">Nenhum item adicionado</p>
                  <p className="text-xs text-gray-400 mt-1">Adicione itens na tela de itens</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botão Adicionar Item */}
        <button
          onClick={() => setShowNovoItem(true)}
          disabled={!ambienteSelecionado}
          className="fixed bottom-6 right-6 w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
        </button>
      </aside>

      {/* Input oculto para upload de imagens */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0 && ambienteSelecionado) {
            const file = files[0];
            
            // Checa o tamanho do arquivo (limite de 10MB)
            if (file.size > 10 * 1024 * 1024) {
              toast.error("O arquivo é muito grande. Limite máximo: 10MB");
              return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
              // Verifica se existe ID de referência da foto de entrada
              const referenciaId = localStorage.getItem('referenciaEntradaId');
              
              const novaFoto: Foto = {
                id: Math.random().toString(),
                url: reader.result as string,
                referenciaEntradaId: referenciaId || undefined
              };
              
              // Limpa o localStorage após usar a referência
              if (referenciaId) {
                localStorage.removeItem('referenciaEntradaId');
              }
              
              const ambienteAtualizado = {
                ...ambienteSelecionado,
                fotos: [...ambienteSelecionado.fotos, novaFoto]
              };
              
              const ambientesAtualizados = ambientes.map(amb => 
                amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
              );
              
              setAmbientes(ambientesAtualizados);
              setAmbienteSelecionado(ambienteAtualizado);
              
              // Salvar no localStorage
              localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
              
              // Notificação de sucesso
              toast.success('Foto adicionada com sucesso!');
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* Modal para visualizar imagem */}
      {selectedImage && (
        <Dialog.Root open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
            <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden bg-white">
                <img
                  src={selectedImage}
                  alt="Imagem ampliada"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      
      {/* Modal para adicionar novo ambiente */}
      <NovoAmbienteModal
        isOpen={showNovoAmbiente}
        onClose={() => {
          setShowNovoAmbiente(false);
          setAmbienteParaEditar(null);
        }}
        onAdd={handleAddAmbiente}
        initialData={ambienteParaEditar ? {
          nome: ambienteParaEditar.nome,
          tipo: ambienteParaEditar.tipo,
          observacoes: ambienteParaEditar.observacoes
        } : undefined}
        title={ambienteParaEditar ? "Editar Ambiente" : "Adicionar Novo Ambiente"}
      />

      {/* Modal para adicionar novo item */}
      {showNovoItem && (
        <NovoItemModal 
          isOpen={showNovoItem}
          onClose={() => setShowNovoItem(false)}
          onAdd={handleAddItem}
        />
      )}
      
      <Toaster position="top-center" />
    </div>
  );
} 
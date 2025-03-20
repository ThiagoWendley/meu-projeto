'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Plus, X, Image as ImageIcon, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

interface Item {
  id: string;
  nome: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  estado: EstadoItem;
  fotos: ItemFoto[];
  detalhes: ItemDetalhe[];
  observacoes?: string;
  area?: string;
}

type EstadoItem = 'novo' | 'bom' | 'regular' | 'ruim';

interface Ambiente {
  id: string;
  nome: string;
  tipo: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  itens: Item[];
  observacoes?: string;
  fotos: Foto[];
}

interface Foto {
  id: string;
  url: string;
  tipo: 'chave' | 'medidor' | 'outros';
  descricao?: string;
}

interface ItemFoto {
  id: string;
  url: string;
  descricao?: string;
}

interface ItemDetalhe {
  id: string;
  nome: string;
  descricao: string;
}

interface DetalheOpcao {
  id: string;
  nome: string;
  descricoes: string[];
}

// Mock data para opções de detalhes
const detalhesOpcoesMock: DetalheOpcao[] = [
  {
    id: '1',
    nome: 'Cor',
    descricoes: ['Branco', 'Preto', 'Azul', 'Vermelho', 'Amarelo', 'Verde']
  },
  {
    id: '2',
    nome: 'Material',
    descricoes: ['Madeira', 'Metal', 'Vidro', 'Plástico', 'Cerâmica', 'Porcelanato']
  },
  {
    id: '3',
    nome: 'Estado',
    descricoes: ['Novo', 'Seminovo', 'Usado', 'Danificado', 'Em manutenção']
  },
  {
    id: '4',
    nome: 'Funcionamento',
    descricoes: ['Funcionando', 'Com defeito', 'Não testado']
  }
];

interface NovoDetalheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (detalhes: DetalheOpcao[]) => void;
}

function NovoDetalheModal({ isOpen, onClose, onAdd }: NovoDetalheModalProps) {
  const [selectedDetalhes, setSelectedDetalhes] = useState<DetalheOpcao[]>([]);
  const [novoDetalhe, setNovoDetalhe] = useState({ nome: '', descricao: '' });
  const [showNovoDetalheForm, setShowNovoDetalheForm] = useState(false);

  const handleToggleDetalhe = (detalhe: DetalheOpcao) => {
    setSelectedDetalhes(prev => {
      const isSelected = prev.some(d => d.id === detalhe.id);
      if (isSelected) {
        return prev.filter(d => d.id !== detalhe.id);
      }
      return [...prev, detalhe];
    });
  };

  const handleAddNovoDetalhe = () => {
    if (novoDetalhe.nome && novoDetalhe.descricao) {
      const novoDetalheOpcao: DetalheOpcao = {
        id: Math.random().toString(),
        nome: novoDetalhe.nome,
        descricoes: [novoDetalhe.descricao]
      };
      setSelectedDetalhes(prev => [...prev, novoDetalheOpcao]);
      setNovoDetalhe({ nome: '', descricao: '' });
      setShowNovoDetalheForm(false);
    }
  };

  const handleSubmit = () => {
    onAdd(selectedDetalhes);
    setSelectedDetalhes([]);
    setNovoDetalhe({ nome: '', descricao: '' });
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[1101] p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Adicionar Detalhes
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Detalhes Predefinidos</h3>
              <button
                onClick={() => setShowNovoDetalheForm(true)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Detalhe
              </button>
            </div>

            {showNovoDetalheForm && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Detalhe
                  </label>
                  <input
                    type="text"
                    value={novoDetalhe.nome}
                    onChange={(e) => setNovoDetalhe(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: Material, Cor, etc..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={novoDetalhe.descricao}
                    onChange={(e) => setNovoDetalhe(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: Madeira, Vermelho, etc..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNovoDetalhe}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            {detalhesOpcoesMock.map((detalhe) => (
              <button
                key={detalhe.id}
                onClick={() => handleToggleDetalhe(detalhe)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedDetalhes.some(d => d.id === detalhe.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{detalhe.nome}</h3>
                <p className="text-sm text-gray-500">
                  {detalhe.descricoes.join(', ')}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              disabled={selectedDetalhes.length === 0}
            >
              Adicionar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface EditarDetalheModalProps {
  isOpen: boolean;
  onClose: () => void;
  detalhe: ItemDetalhe;
  opcoes: string[];
  onSave: (detalhe: ItemDetalhe) => void;
}

function EditarDetalheModal({ isOpen, onClose, detalhe, opcoes, onSave }: EditarDetalheModalProps) {
  const [descricaoSelecionada, setDescricaoSelecionada] = useState(detalhe.descricao);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [showNovaDescricao, setShowNovaDescricao] = useState(false);

  const handleSubmit = () => {
    onSave({
      ...detalhe,
      descricao: showNovaDescricao ? novaDescricao : descricaoSelecionada
    });
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[1101] p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {detalhe.nome}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <button
                onClick={() => setShowNovaDescricao(!showNovaDescricao)}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                {showNovaDescricao ? 'Usar Existente' : 'Nova Descrição'}
              </button>
            </div>

            {showNovaDescricao ? (
              <input
                type="text"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Digite uma nova descrição..."
              />
            ) : (
              <select
                value={descricaoSelecionada}
                onChange={(e) => setDescricaoSelecionada(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {opcoes.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              Salvar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Mock data para ambientes
const ambientesMock: Ambiente[] = [
  {
    id: '1',
    nome: 'Sala',
    tipo: 'Sala',
    status: 'pendente',
    itens: [
      {
        id: '1',
        nome: 'Piso',
        status: 'pendente',
        estado: 'bom',
        fotos: [],
        detalhes: [],
        observacoes: ''
      },
      {
        id: '2',
        nome: 'Parede',
        status: 'pendente',
        estado: 'bom',
        fotos: [],
        detalhes: [],
        observacoes: ''
      }
    ],
    fotos: [],
    observacoes: ''
  }
];

export default function ItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId');
  const ambienteId = searchParams.get('ambienteId');
  const vistoriaId = searchParams.get('vistoriaId');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<ItemFoto[]>([]);
  const [detalhes, setDetalhes] = useState<ItemDetalhe[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [showNovoDetalhe, setShowNovoDetalhe] = useState(false);
  const [detalheParaEditar, setDetalheParaEditar] = useState<ItemDetalhe | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
 
  // Estados para a vistoria de entrada/saída
  const [ehVistoriaSaida, setEhVistoriaSaida] = useState(false);
  const [vistoriaTab, setVistoriaTab] = useState<'entrada' | 'saida'>('saida');
  const [entryInspectionCode, setEntryInspectionCode] = useState<string | null>(null);
  const [codigoVistoria, setCodigoVistoria] = useState<string>('570');

  useEffect(() => {
    if (!itemId || !ambienteId) {
      router.back();
      return;
    }

    const ambienteEncontrado = ambientesMock.find(a => a.id === ambienteId);
    if (!ambienteEncontrado) {
      router.back();
      return;
    }

    const itemEncontrado = ambienteEncontrado.itens.find(i => i.id === itemId);
    if (!itemEncontrado) {
      router.back();
      return;
    }

    setItem(itemEncontrado);
    setAmbiente(ambienteEncontrado);
    setFotos(itemEncontrado.fotos);
    setDetalhes(itemEncontrado.detalhes);
    setObservacoes(itemEncontrado.observacoes || '');
    
    // Verificar se é uma vistoria de saída usando localStorage
    try {
      const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
      if (vistoriaAtivaString) {
        const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
        if (vistoriaAtiva && vistoriaAtiva.tipoVistoria === 'saida') {
          setEhVistoriaSaida(true);
          if (vistoriaAtiva.entryInspectionCode) {
            setEntryInspectionCode(vistoriaAtiva.entryInspectionCode);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar tipo de vistoria:', error);
    }
  }, [itemId, ambienteId, router]);

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entryInspectionCode, setEntryInspectionCode] = useState<string | null>(null);
  const [codigoVistoria, setCodigoVistoria] = useState<string>('570');
  
  useEffect(() => {
    // Verificar se existem parâmetros de vistoria, ambiente e item
    const vistoriaId = searchParams?.get('vistoriaId');
    const ambienteId = searchParams?.get('ambienteId');
    const itemId = searchParams?.get('itemId');
    
    if (!vistoriaId || !ambienteId || !itemId) {
      // Se algum parâmetro estiver faltando, redirecionar para a página principal de vistorias
      router.push('/dashboard/vistoriador/vistoriar');
    } else {
      // Verificar se é uma vistoria de saída
      try {
        const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
        if (vistoriaAtivaString) {
          const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
          if (vistoriaAtiva && vistoriaAtiva.tipoVistoria === 'saida') {
            setEhVistoriaSaida(true);
            if (vistoriaAtiva.entryInspectionCode) {
              setEntryInspectionCode(vistoriaAtiva.entryInspectionCode);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar tipo de vistoria:', error);
      }
      
      // Aqui carregaria os dados do ambiente e do item
      // Simulação com dados mock
      setLoading(false);
    }
  }, [router, searchParams]);

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

  const estadosItem: { id: EstadoItem; nome: string; cor: string }[] = [
    { id: 'novo', nome: 'Novo', cor: 'bg-green-500' },
    { id: 'bom', nome: 'Bom', cor: 'bg-blue-500' },
    { id: 'regular', nome: 'Regular', cor: 'bg-yellow-500' },
    { id: 'ruim', nome: 'Ruim', cor: 'bg-red-500' }
  ];

  // Função para obter as fotos baseada na tab selecionada (entrada/saída)
  const getFotosPorTab = () => {
    if (!item) return [];
    
    if (ehVistoriaSaida && vistoriaTab === 'entrada') {
      // Para a aba Entrada em vistoria de saída, mostrar fotos da vistoria de entrada
      if (vistoriaEntrada.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].fotos;
      } else {
        // Se não encontrar pelo ID exato, simplificando para exemplo
        const itemEntrada = Object.entries(vistoriaEntrada.itens)[0];
        return itemEntrada ? itemEntrada[1].fotos : [];
      }
    } else {
      // Para a aba Saída ou vistoria normal, mostrar fotos do item atual
      return fotos;
    }
  };

  // Função para obter os detalhes baseada na tab selecionada (entrada/saída)
  const getDetalhesPorTab = () => {
    if (!item) return [];
    
    if (ehVistoriaSaida && vistoriaTab === 'entrada') {
      // Para a aba Entrada em vistoria de saída, mostrar detalhes da vistoria de entrada
      if (vistoriaEntrada.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].detalhes;
      } else {
        // Simplificando para exemplo
        const itemEntrada = Object.entries(vistoriaEntrada.itens)[0];
        return itemEntrada ? itemEntrada[1].detalhes : [];
      }
    } else {
      // Para a aba Saída ou vistoria normal, mostrar detalhes do item atual
      return detalhes;
    }
  };

  // Função para obter as observações baseada na tab selecionada (entrada/saída)
  const getObservacoesPorTab = () => {
    if (!item) return '';
    
    if (ehVistoriaSaida && vistoriaTab === 'entrada') {
      // Para a aba Entrada em vistoria de saída, mostrar observações da vistoria de entrada
      if (vistoriaEntrada.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].observacoes;
      } else {
        // Simplificando para exemplo
        const itemEntrada = Object.entries(vistoriaEntrada.itens)[0];
        return itemEntrada ? itemEntrada[1].observacoes : '';
      }
    } else {
      // Para a aba Saída ou vistoria normal, mostrar observações do item atual
      return observacoes;
    }
  };

  // Função para obter o estado baseado na tab selecionada (entrada/saída)
  const getEstadoPorTab = () => {
    if (!item) return 'bom' as EstadoItem;
    
    if (ehVistoriaSaida && vistoriaTab === 'entrada') {
      // Para a aba Entrada em vistoria de saída, mostrar estado da vistoria de entrada
      if (vistoriaEntrada.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].estado;
      } else {
        // Simplificando para exemplo
        const itemEntrada = Object.entries(vistoriaEntrada.itens)[0];
        return itemEntrada ? itemEntrada[1].estado : 'bom' as EstadoItem;
      }
    } else {
      // Para a aba Saída ou vistoria normal, mostrar estado do item atual
      return item.estado;
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleAddFoto = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateObservacoes = (texto: string) => {
    setObservacoes(texto);
  };

  const handleChangeEstado = (novoEstado: EstadoItem) => {
    if (!item || !ambiente) return;
    
    // Só permite alterar o estado na aba de saída ou em vistorias normais
    if (ehVistoriaSaida && vistoriaTab === 'entrada') return;

    const newItem = { ...item, estado: novoEstado };
    setItem(newItem);

    // Atualiza o item no ambiente
    const newAmbiente = {
      ...ambiente,
      itens: ambiente.itens.map(i => i.id === item.id ? newItem : i)
    };
    setAmbiente(newAmbiente);
  };

  const handleDeleteDetalhe = (detalheId: string) => {
    setDetalhes(prev => prev.filter(d => d.id !== detalheId));
  };

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [detalheParaDeletar, setDetalheParaDeletar] = useState<string | null>(null);

  const handleLongPressStart = (detalheId: string) => {
    const timer = setTimeout(() => {
      setDetalheParaDeletar(detalheId);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  if (!item || !ambiente) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lista de Itens */}
      <aside className="w-52 bg-white border-r border-border h-screen sticky top-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Itens de {ambiente.nome}</h2>
          </div>
          <div className="space-y-2">
            {ambiente.itens.map((itemLista) => (
              <button
                key={itemLista.id}
                onClick={() => router.push(`/dashboard/vistoriador/vistoriar/item?id=${itemLista.id}&ambiente=${ambiente.id}${ehVistoriaSaida ? `&tipoVistoria=saida&entryInspectionCode=${entryInspectionCode}` : ''}`)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  itemLista.id === item.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900">{itemLista.nome}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    estadosItem.find(e => e.id === itemLista.estado)?.cor || 'bg-gray-300'
                  }`}></span>
                  <span className="text-xs text-gray-500">
                    {estadosItem.find(e => e.id === itemLista.estado)?.nome || 'Não avaliado'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-border py-5 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleVoltar} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {item?.nome || 'Detalhes do Item'}
                </h1>
                {ehVistoriaSaida && (
                  <span className="text-xs text-gray-500">(cód. vistoria de entrada: {entryInspectionCode || '000'})</span>
                )}
              </div>
              <span className="text-xs text-gray-500">Código da Vistoria: {codigoVistoria || '000'}</span>
            </div>
          </div>
        </header>

        <div className="p-4">
          {/* Tabs Entrada/Saída - Exibidas apenas para vistorias de saída */}
          {ehVistoriaSaida && (
            <div className="bg-white rounded-xl border border-border p-2 mb-4">
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
          )}

          <Tabs.Root defaultValue="fotos" className="space-y-4">
            <Tabs.List className="flex gap-4 border-b border-border">
              <Tabs.Trigger
                value="fotos"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
              >
                Fotos
              </Tabs.Trigger>
              <Tabs.Trigger
                value="detalhes"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
              >
                Detalhes
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="fotos" className="space-y-6">
              {/* Grade de Fotos */}
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fotos do Item</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getFotosPorTab().map((foto) => (
                    <div key={foto.id} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-gray-50">
                      <Image
                        src={foto.url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleAddFoto}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm font-medium">Adicionar Foto</span>
                  </button>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-white rounded-xl border border-border p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações do Item</h2>
                
                {/* Condicionalmente exibir campo editável ou texto somente leitura baseado na tab */}
                {ehVistoriaSaida && vistoriaTab === 'entrada' ? (
                  // Texto somente leitura para aba "entrada" em vistoria de saída
                  <div className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 min-h-[100px]">
                    {getObservacoesPorTab()}
                  </div>
                ) : (
                  // Campo editável para aba "saída" ou vistoria normal
                  <textarea
                    value={getObservacoesPorTab()}
                    onChange={(e) => handleUpdateObservacoes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Adicione observações sobre este item..."
                  />
                )}
              </div>
            </Tabs.Content>

            <Tabs.Content value="detalhes" className="space-y-6">
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Detalhes do Item</h2>
                  
                  {/* Botão para adicionar detalhe - apenas visível na aba de saída ou vistoria normal */}
                  {(!ehVistoriaSaida || vistoriaTab === 'saida') && (
                    <button
                      onClick={() => setShowNovoDetalhe(true)}
                      className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
                    >
                      + Adicionar Detalhe
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {getDetalhesPorTab().map((detalhe) => (
                    <div
                      key={detalhe.id}
                      className="p-3 rounded-lg border border-border bg-white shadow-sm"
                      onTouchStart={() => handleLongPressStart(detalhe.id)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchMove={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{detalhe.nome}</h3>
                        
                        {/* Ações de exclusão - apenas visíveis na aba de saída ou vistoria normal */}
                        {(!ehVistoriaSaida || vistoriaTab === 'saida') && (
                          <button
                            onClick={() => handleDeleteDetalhe(detalhe.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{detalhe.descricao}</p>
                    </div>
                  ))}
                  
                  {getDetalhesPorTab().length === 0 && (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-500">Nenhum detalhe cadastrado</p>
                      {(!ehVistoriaSaida || vistoriaTab === 'saida') && (
                        <button
                          onClick={() => setShowNovoDetalhe(true)}
                          className="mt-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                        >
                          + Adicionar Detalhe
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>

      {/* Estado do Item */}
      <aside className="w-52 bg-white border-l border-border h-screen sticky top-0 overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Estado do Item</h2>
          </div>
          <div className="space-y-3">
            {/* Informa que o estado só pode ser visualizado na aba de entrada */}
            {ehVistoriaSaida && vistoriaTab === 'entrada' && (
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600 mb-3">
                Estado do item na vistoria de entrada. Para alterar, mude para a aba "Saída".
              </div>
            )}
            
            {/* Exibe o dropdown quando na aba de saída ou em vistorias normais */}
            {(!ehVistoriaSaida || vistoriaTab === 'saida') ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o estado do item:
                </label>
                <select
                  value={getEstadoPorTab()}
                  onChange={(e) => handleChangeEstado(e.target.value as EstadoItem)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {estadosItem.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nome}
                    </option>
                  ))}
                </select>
                
                {/* Exibe também os botões de estado para referência visual */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Representação visual:</p>
                  <div className="space-y-2">
                    {estadosItem.map((estado) => (
                      <div 
                        key={estado.id}
                        className={`p-2 rounded-lg flex items-center gap-2 ${
                          getEstadoPorTab() === estado.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${estado.cor}`}></span>
                        <span className="text-sm">{estado.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Exibe apenas os botões quando na aba de entrada (modo somente leitura)
              <div className="space-y-2">
                {estadosItem.map((estado) => (
                  <button
                    key={estado.id}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      getEstadoPorTab() === estado.id
                        ? 'bg-primary/5 border-2 border-primary'
                        : 'border-2 border-transparent'
                    } cursor-default`}
                    disabled={true}
                  >
                    <span className={`w-4 h-4 rounded-full ${estado.cor}`}></span>
                    <span className="font-medium">{estado.nome}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Área do Item */}
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Área do Item</h2>
            </div>
            
            {/* Informa que a área só pode ser editada na aba de saída */}
            {ehVistoriaSaida && vistoriaTab === 'entrada' && (
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600 mb-3">
                Área do item na vistoria de entrada. Para alterar, mude para a aba "Saída".
              </div>
            )}
            
            {/* Campo de edição da área - apenas visível na aba de saída ou vistoria normal */}
            {(!ehVistoriaSaida || vistoriaTab === 'saida') ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Informe a área do item:
                </label>
                <input
                  type="text"
                  value={item?.area || ''}
                  onChange={(e) => {
                    // Remover caracteres não numéricos, exceto ponto e vírgula
                    let valor = e.target.value.replace(/[^\d.,]/g, '');
                    
                    // Garantir que há apenas um separador decimal
                    const qtdSeparadores = (valor.match(/[.,]/g) || []).length;
                    if (qtdSeparadores > 1) {
                      const ultimoSeparador = Math.max(valor.lastIndexOf('.'), valor.lastIndexOf(','));
                      valor = valor.substring(0, ultimoSeparador) + valor.substring(ultimoSeparador).replace(/[.,]/g, '');
                    }
                    
                    if (item && ambiente) {
                      const itemAtualizado = { ...item, area: valor };
                      const novosItens = ambiente.itens.map(i => 
                        i.id === item.id ? itemAtualizado : i
                      );
                      
                      const ambienteAtualizado = { ...ambiente, itens: novosItens };
                      setAmbiente(ambienteAtualizado);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() && item && ambiente) {
                      let valorNumerico = e.target.value.replace(',', '.');
                      if (!isNaN(parseFloat(valorNumerico))) {
                        valorNumerico = parseFloat(valorNumerico).toFixed(2);
                        
                        const itemAtualizado = { ...item, area: `${valorNumerico} m²` };
                        const novosItens = ambiente.itens.map(i => 
                          i.id === item.id ? itemAtualizado : i
                        );
                        
                        const ambienteAtualizado = { ...ambiente, itens: novosItens };
                        setAmbiente(ambienteAtualizado);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0.00 m²"
                />
                <p className="mt-1 text-xs text-gray-500">Formato: 0.00 m²</p>
              </div>
            ) : (
              // Exibição somente leitura quando na aba de entrada
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-gray-700">
                  {item?.area || 'Não informado'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Input de Arquivo Oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const file = files[0];
            const novaFoto: ItemFoto = {
              id: Math.random().toString(),
              url: URL.createObjectURL(file),
              descricao: ''
            };
            setFotos([...fotos, novaFoto]);
          }
        }}
      />

      {/* Modal de Novo Detalhe */}
      <NovoDetalheModal
        isOpen={showNovoDetalhe}
        onClose={() => setShowNovoDetalhe(false)}
        onAdd={(detalhesOpcoes) => {
          const novosDetalhes = detalhesOpcoes.map(opcao => ({
            id: Math.random().toString(),
            nome: opcao.nome,
            descricao: opcao.descricoes[0]
          }));
          setDetalhes([...detalhes, ...novosDetalhes]);
        }}
      />

      {/* Modal de Editar Detalhe */}
      {detalheParaEditar && (
        <EditarDetalheModal
          isOpen={!!detalheParaEditar}
          onClose={() => setDetalheParaEditar(null)}
          detalhe={detalheParaEditar}
          opcoes={detalhesOpcoesMock.find(d => d.nome === detalheParaEditar.nome)?.descricoes || []}
          onSave={(detalheAtualizado) => {
            setDetalhes(prev => prev.map(d => 
              d.id === detalheAtualizado.id ? detalheAtualizado : d
            ));
            setDetalheParaEditar(null);
          }}
        />
      )}
    </div>
  );
} 
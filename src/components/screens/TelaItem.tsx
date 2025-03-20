'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Copy, Trash2, MoreVertical, Check, AlertTriangle, Edit3, Camera, X, ImageIcon, GripVertical, Pencil } from 'lucide-react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';

// Interfaces
interface Foto {
  id: string;
  url: string;
  descricao?: string;
  referenciaEntradaId?: string;
}

interface NovoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { nome: string; tipo: string }) => void;
  itemInicial?: { nome: string; tipo: string } | null;
  title?: string;
}

interface ItemTemplate {
  id: string;
  nome: string;
  tipo: string;
}

type EstadoItem = 'novo' | 'bom' | 'regular' | 'ruim';

interface Item {
  id: string;
  nome: string;
  tipo: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
}

interface Detalhe {
  id: string;
  nome: string;
  valor: string;
}

interface NovoDetalheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (detalhe: Omit<Detalhe, 'id'>) => void;
  detalhesPredefinidos: Record<string, string[]>;
  onAddPredefinido: (nome: string, valor: string) => void;
}

interface ItemCompleto extends Item {
  fotos: Foto[];
  detalhes: Detalhe[];
  observacoes: string;
  estado: EstadoItem;
  ambiente?: string;
}

interface EditarDetalheModalProps {
  isOpen: boolean;
  onClose: () => void;
  detalhe: Detalhe;
  onSave: (detalhe: Omit<Detalhe, 'id'>) => void;
  opcoes: string[];
}

interface ImagemExpandidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (imagemEditada: string) => void;
}

interface DiagonalImageCardProps {
  entradaImageUrl: string;
  saidaImageUrl?: string;
  onAddSaidaImage: () => void;
  onViewImage: (imageUrl: string) => void;
  onDeleteSaidaImage?: (e: React.MouseEvent) => void;
  entradaDescricao?: string;
  saidaDescricao?: string;
  entradaId: string;
}

// Componente principal
export default function TelaItem() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fotos' | 'detalhes'>('fotos');
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [showNovoDetalhe, setShowNovoDetalhe] = useState(false);
  const [showEditarDetalhe, setShowEditarDetalhe] = useState(false);
  const [detalheSelecionado, setDetalheSelecionado] = useState<Detalhe | null>(null);
  const [itemSelecionado, setItemSelecionado] = useState<ItemCompleto | null>(null);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  const [fotoParaEdicao, setFotoParaEdicao] = useState<Foto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const [editItemData, setEditItemData] = useState<{ nome: string; tipo: string } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [modoSelecaoImagens, setModoSelecaoImagens] = useState(false);
  const [imagensSelecionadas, setImagensSelecionadas] = useState<string[]>([]);
  const [editingDetalhe, setEditingDetalhe] = useState<Detalhe | null>(null);
  const [itens, setItens] = useState<ItemCompleto[]>([]);
  const [detalhesPredefinidos, setDetalhesPredefinidos] = useState<Record<string, string[]>>({
    'Cor': ['Branco', 'Preto', 'Azul', 'Vermelho', 'Amarelo', 'Verde'],
    'Material': ['Madeira', 'Metal', 'Vidro', 'Plástico', 'Cerâmica', 'Porcelanato'],
    'Estado': ['Novo', 'Seminovo', 'Usado', 'Danificado', 'Em manutenção'],
    'Funcionamento': ['Funcionando', 'Com defeito', 'Não testado']
  });
  
  // Obter as fotos
  const getFotosPorTab = () => {
    if (!itemSelecionado) return [];
    return itemSelecionado.fotos;
  };
  
  // Obter as observações
  const getObservacoesPorTab = () => {
    if (!itemSelecionado) return '';
    return itemSelecionado.observacoes;
  };
  
  // Obter os detalhes
  const getDetalhesPorTab = () => {
    if (!itemSelecionado) return [];
    return itemSelecionado.detalhes;
  };

  // Restante das definições de estados
  const [ambienteId, setAmbienteId] = useState<string | null>(null);
  const [nomeAmbiente, setNomeAmbiente] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Adicionar estados para drag-and-drop e seleção
  const [modoSelecao, setModoSelecao] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ItemCompleto | null>(null);
  const [modalImagemAberto, setModalImagemAberto] = useState(false);
  const [estaEditando, setEstaEditando] = useState(false);
  const [novoItem, setNovoItem] = useState<ItemCompleto>({
    id: "",
    nome: "",
    tipo: "",
    status: "pendente" as const,
    fotos: [],
    detalhes: [],
    observacoes: "",
    estado: "novo" as const
  });
  
  // Estado para controlar qual botão de comparação está selecionado
  const [comparacaoSelecionada, setComparacaoSelecionada] = useState<'igual' | 'diferente' | null>(null);
  
  // Verificar se há parâmetros de URL para ambiente e item
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const ambienteIdParam = queryParams.get('ambienteId');
    const itemIdParam = queryParams.get('itemId');
    
    if (ambienteIdParam) {
      setAmbienteId(ambienteIdParam);
      
      // Buscar o nome do ambiente do localStorage
      const ambientesArmazenados = localStorage.getItem('ambientes');
      if (ambientesArmazenados) {
        try {
          const ambientesParsed = JSON.parse(ambientesArmazenados);
          const ambienteEncontrado = ambientesParsed.find((amb: any) => amb.id === ambienteIdParam);
          if (ambienteEncontrado) {
            setNomeAmbiente(ambienteEncontrado.nome);
          }
        } catch (error) {
          console.error('Erro ao buscar nome do ambiente:', error);
        }
      }
    }
    
    if (itemIdParam) {
      // Se houver um ID de item, selecionar o item correspondente
      const itemEncontrado = itens.find(item => item.id === itemIdParam);
      if (itemEncontrado) {
        setItemSelecionado(itemEncontrado);
      }
    }
  }, [itens]);

  useEffect(() => {
    setIsLoading(true);
    
    // Carregar itens do localStorage
    const itensArmazenados = localStorage.getItem('itens');
    if (itensArmazenados) {
      try {
        const itensParseados = JSON.parse(itensArmazenados);
        setItens(itensParseados);
        
        // Se tiver um ambienteId definido, filtrar itens por ambiente
        if (ambienteId) {
          const itensFiltrados = itensParseados.filter((item: ItemCompleto & { ambiente?: string }) => 
            item.ambiente === ambienteId
          );
          
          if (itensFiltrados.length > 0) {
            setItemSelecionado(itensFiltrados[0]);
          } else if (itensParseados.length > 0) {
            // Se não houver itens para o ambiente, não selecione nenhum item
            setItemSelecionado(null);
          }
        } else if (itensParseados.length > 0) {
          setItemSelecionado(itensParseados[0]);
        }
      } catch (error) {
        console.error('Erro ao parsear itens do localStorage:', error);
        setItens([]); // Se houver erro, inicializa com array vazio
      }
    } else {
      // Carrega dados de teste se não houver dados no localStorage
      setTimeout(() => {
        const itensIniciais = [
          {
            id: "1",
            nome: "TV",
            tipo: "Eletrônico",
            status: "pendente" as const,
            fotos: [],
            detalhes: [],
            observacoes: "",
            estado: "novo" as EstadoItem,
            ambiente: "1"
          },
          {
            id: "2",
            nome: "Sofá",
            tipo: "Mobília",
            status: "pendente" as const,
            fotos: [],
            detalhes: [],
            observacoes: "",
            estado: "novo" as EstadoItem,
            ambiente: "1"
          },
          {
            id: "3",
            nome: "Mesa de Jantar",
            tipo: "Mobília",
            status: "pendente" as const,
            fotos: [],
            detalhes: [],
            observacoes: "",
            estado: "novo" as EstadoItem,
            ambiente: "2"
          }
        ];
        
        setItens(itensIniciais);
        
        // Se tiver um ambienteId definido, filtrar itens por ambiente
        if (ambienteId) {
          const itensFiltrados = itensIniciais.filter(item => item.ambiente === ambienteId);
          if (itensFiltrados.length > 0) {
            setItemSelecionado(itensFiltrados[0]);
          } else {
            // Se não houver itens para o ambiente, não selecione nenhum item
            setItemSelecionado(null);
          }
        } else if (itensIniciais.length > 0) {
          setItemSelecionado(itensIniciais[0]);
        }

        // Salva os itens iniciais no localStorage
        localStorage.setItem('itens', JSON.stringify(itensIniciais));
      }, 1000);
    }
    
    setIsLoading(false);
  }, [ambienteId]);

  // Funções para manipular seleção e interações de drag-and-drop
  const handleLongPress = (item: ItemCompleto) => {
    setModoSelecao(true);
    setItensSelecionados([item.id]);
  };
  
  const handleTouchStart = (item: ItemCompleto) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(item);
    }, 500);
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
  
  const handleMouseDown = (item: ItemCompleto) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(item);
    }, 500);
  };
  
  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCardClick = (item: ItemCompleto) => {
    if (modoSelecao) {
      setItensSelecionados(prev => 
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      setItemSelecionado(item);
    }
  };

  const handleDragStart = (item: ItemCompleto) => {
    setDraggedItem(item);
    setIsDragging(true);
  };

  const handleDragOver = (targetItem: ItemCompleto) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItens = [...itens];
    const draggedIndex = newItens.findIndex(i => i.id === draggedItem.id);
    const targetIndex = newItens.findIndex(i => i.id === targetItem.id);
    
    const [removed] = newItens.splice(draggedIndex, 1);
    newItens.splice(targetIndex, 0, removed);
    
    setItens(newItens);
    salvarItensNoLocalStorage(newItens);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };

  // Funções para ações de edição, duplicação e exclusão
  const handleEditarItem = (item: ItemCompleto) => {
    setItemSelecionado(item);
    setShowNovoItem(true);
  };
  
  const handleEditarItemClick = (item: ItemCompleto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click seja propagado para o card
    handleEditarItem(item);
  };

  const handleDuplicarItem = (item: ItemCompleto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click seja propagado para o card
    const novoItem = {
      ...item,
      id: Math.random().toString(),
      nome: `${item.nome} (Cópia)`
    };
    const itensAtualizados = [...itens, novoItem];
    setItens(itensAtualizados);
    salvarItensNoLocalStorage(itensAtualizados);
  };

  const handleExcluirItem = (item: ItemCompleto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click seja propagado para o card
    if (confirm(`Deseja excluir o item ${item.nome}?`)) {
      const itensAtualizados = itens.filter(i => i.id !== item.id);
      setItens(itensAtualizados);
      salvarItensNoLocalStorage(itensAtualizados);
      if (itemSelecionado?.id === item.id) {
        setItemSelecionado(null);
      }
    }
  };

  const sairDoModoSelecao = () => {
    setModoSelecao(false);
    setItensSelecionados([]);
  };

  const handleExcluirSelecionados = () => {
    if (confirm(`Deseja excluir ${itensSelecionados.length} item(s)?`)) {
      const itensAtualizados = itens.filter(item => !itensSelecionados.includes(item.id));
      setItens(itensAtualizados);
      salvarItensNoLocalStorage(itensAtualizados);
      setItensSelecionados([]);
      setModoSelecao(false);
    }
  };
  
  const handleDuplicarSelecionados = () => {
    const itensParaDuplicar = itens.filter(item => itensSelecionados.includes(item.id));
    const novosItens = itensParaDuplicar.map(item => ({
      ...item,
      id: Math.random().toString(),
      nome: `${item.nome} (Cópia)`
    }));
    
    const itensAtualizados = [...itens, ...novosItens];
    setItens(itensAtualizados);
    salvarItensNoLocalStorage(itensAtualizados);
    setItensSelecionados([]);
    setModoSelecao(false);
  };

  const handleAddItem = () => {
    if (showNovoItem) return;
    setShowNovoItem(true);
    setNovoItem({
      id: "",
      nome: "",
      tipo: "",
      status: "pendente" as const,
      fotos: [],
      detalhes: [],
      observacoes: "",
      estado: "novo" as const
    });
    setEstaEditando(false);
  };

  const handleEditItem = (id: string) => {
    const item = itens.find((item) => item.id === id);
    if (item) {
      setNovoItem({ ...item });
      setEstaEditando(true);
      setShowNovoItem(true);
    }
  };

  const handleDeleteItem = (id: string) => {
    const itensAtualizados = itens.filter((item) => item.id !== id);
    setItens(itensAtualizados);
    salvarItensNoLocalStorage(itensAtualizados);
  };

  const handleAddDetalhe = (novoDetalhe: Omit<Detalhe, 'id'>) => {
    if (!itemSelecionado) return;

    // Adiciona a nova descrição à lista de opções predefinidas
    if (!detalhesPredefinidos[novoDetalhe.nome]?.includes(novoDetalhe.valor)) {
      setDetalhesPredefinidos(prev => ({
        ...prev,
        [novoDetalhe.nome]: [...(prev[novoDetalhe.nome] || []), novoDetalhe.valor]
      }));
    }

    if (editingDetalhe) {
      // Atualiza o detalhe existente
      const novosDetalhes = itemSelecionado.detalhes.map(d => 
        d.id === editingDetalhe.id
          ? { ...d, ...novoDetalhe }
          : d
      );

      atualizarItem({
        ...itemSelecionado,
        detalhes: novosDetalhes
      });
      setEditingDetalhe(null);
    } else {
      // Adiciona novo detalhe
      const detalhe: Detalhe = {
        id: Math.random().toString(),
        ...novoDetalhe
      };

      atualizarItem({
        ...itemSelecionado,
        detalhes: [...itemSelecionado.detalhes, detalhe]
      });
    }
  };

  const handleEditDetalhe = (detalheId: string) => {
    if (!itemSelecionado) return;
    const detalhe = itemSelecionado.detalhes.find(d => d.id === detalheId);
    if (detalhe) {
      setEditingDetalhe(detalhe);
      setShowNovoDetalhe(true);
    }
  };

  const handleDeleteDetalhe = (detalheId: string) => {
    if (!itemSelecionado) return;
    atualizarItem({
      ...itemSelecionado,
      detalhes: itemSelecionado.detalhes.filter(d => d.id !== detalheId)
    });
  };

  const handleAddPredefinido = (nome: string, valor: string) => {
    setDetalhesPredefinidos(prev => ({
      ...prev,
      [nome]: [...(prev[nome] || []), valor]
    }));
  };

  const atualizarItem = (itemAtualizado: ItemCompleto) => {
    const itensAtualizados = itens.map(item => 
      item.id === itemAtualizado.id ? itemAtualizado : item
    );
    setItens(itensAtualizados);
    setItemSelecionado(itemAtualizado);
    salvarItensNoLocalStorage(itensAtualizados);
  };

  const handleAddFoto = (foto: Foto) => {
    if (!itemSelecionado) return;
    atualizarItem({
      ...itemSelecionado,
      fotos: [...itemSelecionado.fotos, foto]
    });
  };

  const handleUpdateObservacoes = (novasObservacoes: string) => {
    if (!itemSelecionado) return;
    atualizarItem({
      ...itemSelecionado,
      observacoes: novasObservacoes
    });
  };

  const handleUpdateEstado = (novoEstado: EstadoItem) => {
    if (!itemSelecionado) return;
    atualizarItem({
      ...itemSelecionado,
      estado: novoEstado
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && itemSelecionado) {
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
        
        const itemAtualizado = {
          ...itemSelecionado,
          fotos: [...itemSelecionado.fotos, novaFoto]
        };
        
        atualizarItem(itemAtualizado);
        
        // Notificação de sucesso
        toast.success('Foto adicionada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditedImage = (fotoId: string, imagemEditada: string) => {
    if (!itemSelecionado) return;
    
    const novasFotos = itemSelecionado.fotos.map(foto => 
      foto.id === fotoId ? { ...foto, url: imagemEditada } : foto
    );

    atualizarItem({
      ...itemSelecionado,
      fotos: novasFotos
    });
  };

  // Função para salvar itens no localStorage
  const salvarItensNoLocalStorage = (itensAtualizados: ItemCompleto[]) => {
    localStorage.setItem('itens', JSON.stringify(itensAtualizados));
  };

  // Funções para manipulação de seleção de imagens
  const handleLongPressImagem = (foto: Foto) => {
    setModoSelecaoImagens(true);
    setImagensSelecionadas([foto.id]);
  };

  const handleClickImagem = (foto: Foto, event: React.MouseEvent) => {
    if (modoSelecaoImagens) {
      event.preventDefault();
      setImagensSelecionadas(prev => 
        prev.includes(foto.id)
          ? prev.filter(id => id !== foto.id)
          : [...prev, foto.id]
      );
    } else {
      setImagemSelecionada(foto.url);
    }
  };

  const handleExcluirImagensSelecionadas = () => {
    if (!itemSelecionado || imagensSelecionadas.length === 0) return;
    
    if (confirm(`Deseja excluir ${imagensSelecionadas.length} imagem(ns)?`)) {
      const fotosFiltradas = itemSelecionado.fotos.filter(
        foto => !imagensSelecionadas.includes(foto.id)
      );
      
      atualizarItem({
        ...itemSelecionado,
        fotos: fotosFiltradas
      });
      
      setImagensSelecionadas([]);
      setModoSelecaoImagens(false);
    }
  };

  const sairDoModoSelecaoImagens = () => {
    setModoSelecaoImagens(false);
    setImagensSelecionadas([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Lista de Itens (Sidebar Esquerda) */}
      <aside className="w-52 bg-white border-r border-border h-screen fixed left-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {ambienteId ? `Itens - ${nomeAmbiente}` : "Todos os Itens"}
            </h2>
            {modoSelecao && (
              <button
                onClick={sairDoModoSelecao}
                className="p-1.5 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-full transition-colors"
                title="Sair do modo de seleção"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Botão de Excluir Selecionados - aparece quando há itens selecionados */}
          {modoSelecao && itensSelecionados.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleExcluirSelecionados}
                className="w-full text-xs py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
              >
                Excluir {itensSelecionados.length} item(s)
              </button>
            </div>
          )}

          <div className="space-y-2">
            {itens
              .filter(item => !ambienteId || item.ambiente === ambienteId)
              .map((item) => (
              <div
                key={item.id}
                draggable={modoSelecao}
                onDragStart={() => handleDragStart(item)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(item);
                }}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(item)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={() => handleMouseDown(item)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => handleCardClick(item)}
                className={`w-full p-3 rounded-lg text-left transition-colors relative ${
                  itemSelecionado?.id === item.id
                    ? 'bg-primary/5 border-2 border-primary'
                    : itensSelecionados.includes(item.id)
                    ? 'bg-blue-50 border-2 border-blue-300'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  {modoSelecao && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex flex-col ml-6">
                    <span className="font-medium text-gray-900">{item.nome}</span>
                    <span className="text-xs text-gray-500">{item.tipo}</span>
                  </div>
                </div>
                
                {/* Ícones de ação que aparecem quando o modo de seleção está ativo */}
                {itensSelecionados.includes(item.id) && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 rounded-full px-1 py-0.5">
                    <button
                      onClick={(e) => handleEditarItemClick(item, e)}
                      className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                      title="Editar item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicarItem(item, e)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Duplicar item"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleExcluirItem(item, e)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botão Adicionar Item */}
        <button
          onClick={() => {
            setShowNovoItem(true);
            setEstaEditando(false);
            setItemSelecionado(null);
          }}
          className="fixed bottom-6 left-6 w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adicionar novo item"
        >
          <Plus className="w-5 h-5" />
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 pl-52 pr-48">
        <header className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => {
                  // Se veio de um ambiente específico, voltar para ele
                  if (ambienteId) {
                    router.push(`/dashboard/ambientes?ambienteId=${ambienteId}`);
                  } else {
                    // Caso contrário, voltar para a lista de ambientes
                    router.push('/dashboard/ambientes');
                  }
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{itemSelecionado?.nome || 'Selecione um item'}</h1>
              <div className="w-20"></div>
            </div>
          </div>
          {/* Tabs */}
          <div className="px-4 pb-0">
            <div className="flex gap-4 border-b border-border">
              <button
                onClick={() => setActiveTab('fotos')}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === 'fotos'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fotos
              </button>
              <button
                onClick={() => setActiveTab('detalhes')}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === 'detalhes'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detalhes
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-6">
          {/* Removendo a tabbar Entrada/Saída */}
          
          {activeTab === 'fotos' ? (
            <>
              {/* Área de Fotos - Mostrada apenas quando a aba "Fotos" está ativa */}
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fotos do Item</h2>
                  
                  {/* Botões de ação para fotos */}
                  <div className="flex items-center gap-2">
                    {modoSelecaoImagens ? (
                      <>
                        <button
                          onClick={sairDoModoSelecaoImagens}
                          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Cancelar seleção"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {imagensSelecionadas.length > 0 && (
                          <button
                            onClick={handleExcluirImagensSelecionadas}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir ({imagensSelecionadas.length})</span>
                          </button>
                        )}
                      </>
                    ) : (
                      itemSelecionado?.fotos && itemSelecionado.fotos.length > 0 && (
                        <button
                          onClick={() => setModoSelecaoImagens(true)}
                          className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Selecionar</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Fotos do item */}
                  {getFotosPorTab().map((foto) => (
                    <div
                      key={foto.id}
                      className={`group relative aspect-square rounded-xl overflow-hidden border ${
                        modoSelecaoImagens && imagensSelecionadas.includes(foto.id)
                          ? 'border-2 border-primary ring-2 ring-primary/20'
                          : 'border-border'
                      } bg-gray-50`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleLongPressImagem(foto);
                      }}
                      onMouseDown={() => {
                        longPressTimerRef.current = setTimeout(() => {
                          handleLongPressImagem(foto);
                        }, 500);
                      }}
                      onMouseUp={() => {
                        if (longPressTimerRef.current) {
                          clearTimeout(longPressTimerRef.current);
                        }
                      }}
                      onTouchStart={() => {
                        longPressTimerRef.current = setTimeout(() => {
                          handleLongPressImagem(foto);
                        }, 500);
                      }}
                      onTouchEnd={() => {
                        if (longPressTimerRef.current) {
                          clearTimeout(longPressTimerRef.current);
                        }
                      }}
                    >
                      <button
                        onClick={(e) => handleClickImagem(foto, e)}
                        className="w-full h-full"
                        disabled={modoSelecaoImagens}
                      >
                        <Image
                          src={foto.url}
                          alt={foto.descricao || "Foto do item"}
                          fill
                          className="object-cover"
                        />
                      </button>
                      
                      {/* Opções de seleção */}
                      {modoSelecaoImagens && (
                        <div 
                          onClick={() => {
                            if (imagensSelecionadas.includes(foto.id)) {
                              setImagensSelecionadas(prev => prev.filter(id => id !== foto.id));
                            } else {
                              setImagensSelecionadas(prev => [...prev, foto.id]);
                            }
                          }}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            imagensSelecionadas.includes(foto.id)
                              ? 'border-primary bg-primary'
                              : 'border-white bg-white/30'
                          }`}>
                            {imagensSelecionadas.includes(foto.id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Descrição da imagem na parte inferior */}
                      {foto.descricao && !modoSelecaoImagens && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <span className="text-sm text-white font-medium">{foto.descricao}</span>
                        </div>
                      )}
                      
                      {/* Botão de exclusão individual */}
                      {!modoSelecaoImagens && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Deseja excluir esta foto?')) {
                              if (!itemSelecionado) return;
                              atualizarItem({
                                ...itemSelecionado,
                                fotos: itemSelecionado.fotos.filter(f => f.id !== foto.id)
                              });
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Botão para adicionar nova foto */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!itemSelecionado || modoSelecaoImagens}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm font-medium">Adicionar foto</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Observações - Mostradas apenas na aba "Fotos" */}
              <div className="bg-white rounded-xl border border-border p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações do Item</h2>
                <textarea
                  value={getObservacoesPorTab()}
                  onChange={(e) => handleUpdateObservacoes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Adicione observações sobre este item..."
                />
              </div>
            </>
          ) : (
            /* Detalhes do Item - Mostrados apenas quando a aba "Detalhes" está ativa */
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Detalhes do Item</h2>
                
                <button
                  onClick={() => setShowNovoDetalhe(true)}
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Adicionar Detalhe
                </button>
              </div>
              
              {/* Lista de detalhes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDetalhesPorTab().map((detalhe) => (
                  <div
                    key={detalhe.id}
                    className="p-3 rounded-lg border border-border bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{detalhe.nome}</h4>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditDetalhe(detalhe.id)}
                          className="text-gray-500 hover:text-primary transition-colors p-1"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteDetalhe(detalhe.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors p-1"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700">{detalhe.valor}</p>
                  </div>
                ))}
                
                {getDetalhesPorTab().length === 0 && (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    Nenhum detalhe adicionado para este item
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Estado do Item (Sidebar Direita) */}
      <aside className="w-48 bg-white border-l border-border h-screen fixed right-0 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado do Item</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleUpdateEstado('novo')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                itemSelecionado?.estado === 'novo'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="font-medium text-gray-900">Novo</span>
            </button>
            <button
              onClick={() => handleUpdateEstado('bom')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                itemSelecionado?.estado === 'bom'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-gray-900">Bom</span>
            </button>
            <button
              onClick={() => handleUpdateEstado('regular')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                itemSelecionado?.estado === 'regular'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="font-medium text-gray-900">Regular</span>
            </button>
            <button
              onClick={() => handleUpdateEstado('ruim')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                itemSelecionado?.estado === 'ruim'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-medium text-gray-900">Ruim</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Botão Adicionar Item - Com z-index aumentado para garantir visibilidade */}
      <button
        onClick={() => {
          setShowNovoItem(true);
          setEstaEditando(false);
          setItemSelecionado(null);
        }}
        className="fixed bottom-6 left-6 w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-[9999]"
        title="Adicionar novo item"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Input escondido para seleção de arquivos */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Modal de Novo Item */}
      <NovoItemModal
        isOpen={showNovoItem}
        onClose={() => {
          setShowNovoItem(false);
          setItemSelecionado(null);
        }}
        onAdd={(itemData) => {
          // Quando o usuário clica em "Adicionar Item" no modal, atualizamos 
          // os campos necessários e salvamos o item no localStorage

          if (itemSelecionado) {
            // Editando item existente
            const itensAtualizados = itens.map((item) =>
              item.id === itemSelecionado.id ? { 
                ...itemSelecionado, 
                nome: itemData.nome, 
                tipo: itemData.tipo, 
                ambiente: ambienteId || undefined 
              } : item
            );
            
            setItens(itensAtualizados);
            salvarItensNoLocalStorage(itensAtualizados);
            
            if (itemSelecionado?.id === itemSelecionado.id) {
              setItemSelecionado({
                ...itemSelecionado,
                nome: itemData.nome,
                tipo: itemData.tipo
              });
            }
          } else {
            // Adicionando novo item
            const novoId = (itens.length + 1).toString();
            const novoItemCompleto: ItemCompleto = {
              id: novoId,
              nome: itemData.nome,
              tipo: itemData.tipo,
              status: "pendente",
              fotos: [],
              detalhes: [],
              observacoes: "",
              estado: "novo",
              ambiente: ambienteId || undefined
            };
            
            const itensAtualizados = [...itens, novoItemCompleto];
            setItens(itensAtualizados);
            salvarItensNoLocalStorage(itensAtualizados);
            
            // Se for o primeiro item, selecioná-lo automaticamente
            if (itens.length === 0) {
              setItemSelecionado(novoItemCompleto);
            }
          }
          
          setShowNovoItem(false);
          setItemSelecionado(null);
        }}
        itemInicial={itemSelecionado}
        title={itemSelecionado ? 'Editar Item' : 'Adicionar Novo Item'}
      />

      {/* Modal de Novo/Editar Detalhe */}
      <NovoDetalheModal
        isOpen={showNovoDetalhe}
        onClose={() => {
          setShowNovoDetalhe(false);
          setEditingDetalhe(null);
        }}
        onAdd={handleAddDetalhe}
        detalhesPredefinidos={detalhesPredefinidos}
        onAddPredefinido={handleAddPredefinido}
      />

      {/* Modal de Imagem Expandida */}
      {imagemSelecionada && (
        <ImagemExpandidaModal
          isOpen={!!imagemSelecionada}
          onClose={() => setImagemSelecionada(null)}
          imageUrl={imagemSelecionada}
          onSave={(imagemEditada) => {
            const foto = itemSelecionado?.fotos.find(f => f.url === imagemSelecionada);
            if (foto) {
              handleSaveEditedImage(foto.id, imagemEditada);
            }
          }}
        />
      )}

      {/* Modal de Editar Detalhe */}
      {editingDetalhe && (
        <EditarDetalheModal
          isOpen={!!editingDetalhe}
          onClose={() => setEditingDetalhe(null)}
          detalhe={editingDetalhe}
          onSave={(detalheAtualizado) => {
            handleAddDetalhe(detalheAtualizado);
          }}
          opcoes={detalhesPredefinidos[editingDetalhe.nome] || []}
        />
      )}
    </div>
  );
}

// Componentes de Modal
function NovoItemModal({ isOpen, onClose, onAdd, itemInicial, title = "Adicionar Novo Item" }: NovoItemModalProps) {
  const [nomeItem, setNomeItem] = useState(itemInicial?.nome || '');
  const [tipoItem, setTipoItem] = useState(itemInicial?.tipo || '');
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
  
  // Estados para o modo de seleção
  const [mostrarFormularioCriacao, setMostrarFormularioCriacao] = useState(false);
  const [itensTemplates, setItensTemplates] = useState<ItemTemplate[]>([
    { id: '1', nome: 'Piso de Madeira', tipo: 'Piso' },
    { id: '2', nome: 'Parede com Pintura', tipo: 'Parede' },
    { id: '3', nome: 'Torneira', tipo: 'Hidráulica' },
    { id: '4', nome: 'Porta Principal', tipo: 'Porta' },
    { id: '5', nome: 'Janela de Vidro', tipo: 'Janela' },
  ]);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);

  // Reset do formulário quando abre
  useEffect(() => {
    if (isOpen) {
      if (itemInicial) {
        setNomeItem(itemInicial.nome || '');
        setTipoItem(itemInicial.tipo || '');
        setMostrarFormularioCriacao(true);
      } else {
        setNomeItem('');
        setTipoItem('');
        setMostrarFormularioCriacao(false);
        setItensSelecionados([]);
      }
    }
  }, [isOpen, itemInicial]);
  
  const handleSubmit = () => {
    if (nomeItem.trim() && tipoItem) {
      // Se estiver no modo de edição (com itemInicial)
      if (itemInicial) {
        onAdd({ nome: nomeItem.trim(), tipo: tipoItem });
        onClose();
      } else {
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
    } else {
      toast.error("Por favor, preencha todos os campos");
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
    // No modo de edição, usamos o formulário diretamente
    if (itemInicial) {
      if (nomeItem.trim() && tipoItem) {
        onAdd({ nome: nomeItem.trim(), tipo: tipoItem });
        onClose();
      }
      return;
    }
    
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

  // Se estiver no modo de edição, mostrar apenas o formulário
  if (itemInicial) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[1101] p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
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

  // Modo padrão: seleção de itens
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

          {/* Lista de itens disponíveis para seleção */}
          <div className="space-y-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700">Selecione itens para adicionar:</h3>
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {itensTemplates.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleSelecaoItem(item.id)}
                  className={`flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    itensSelecionados.includes(item.id) ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border ${
                      itensSelecionados.includes(item.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {itensSelecionados.includes(item.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{item.nome}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.tipo})</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleExcluirItemTemplate(item.id, e)}
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
              
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                Adicionar à Lista
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdicionarItensSelecionados}
              disabled={itensSelecionados.length === 0}
              className={`px-4 py-2 bg-primary text-white rounded-lg transition-colors ${
                itensSelecionados.length === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary-light'
              }`}
            >
              Adicionar {itensSelecionados.length > 0 ? `(${itensSelecionados.length})` : ''}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NovoDetalheModal({ isOpen, onClose, onAdd, detalhesPredefinidos, onAddPredefinido }: NovoDetalheModalProps) {
  // Alteração para permitir seleção múltipla
  const [selectedDetails, setSelectedDetails] = useState<{[key: string]: string | null}>({});
  const [showNovoDetalhe, setShowNovoDetalhe] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [showNovaDescricao, setShowNovaDescricao] = useState<string | null>(null);
  const [novaDescricao, setNovaDescricao] = useState('');
  // Estado para controlar quais categorias estão expandidas
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  // Estado para o dicionário de detalhes predefinidos
  const [detalhesPredefinidosState, setDetalhesPredefinidosState] = useState<Record<string, string[]>>(detalhesPredefinidos);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedDetails({});
      setShowNovoDetalhe(false);
      setNovoNome('');
      setNovoValor('');
      setShowNovaDescricao(null);
      setNovaDescricao('');
      setExpandedCategories({});
      setDetalhesPredefinidosState(detalhesPredefinidos);
    }
  }, [isOpen, detalhesPredefinidos]);
  
  const handleAddSelecionados = () => {
    const detalhesValidos = Object.entries(selectedDetails)
      .filter(([nome, valor]) => nome && valor);
    
    if (detalhesValidos.length === 0) {
      toast.error("Por favor, selecione pelo menos um detalhe e seu valor");
      return;
    }
    
    // Adiciona cada detalhe selecionado
    detalhesValidos.forEach(([nome, valor]) => {
      onAdd({ nome, valor: valor as string });
    });
    
    onClose();
  };
  
  const handleAddNovo = () => {
    if (novoNome.trim() && novoValor.trim()) {
      onAddPredefinido(novoNome, novoValor);
      // Atualiza o estado local também
      setDetalhesPredefinidosState(prev => {
        const newState = { ...prev };
        if (!newState[novoNome]) {
          newState[novoNome] = [];
        }
        newState[novoNome] = [...newState[novoNome], novoValor];
        return newState;
      });
      setNovoNome('');
      setNovoValor('');
      setShowNovoDetalhe(false);
    } else {
      toast.error("Preencha o nome e a descrição do detalhe");
    }
  };
  
  const handleAddNovaDescricao = () => {
    if (showNovaDescricao && novaDescricao.trim()) {
      // Adiciona a nova descrição ao estado local
      setDetalhesPredefinidosState(prev => {
        const newState = { ...prev };
        if (!newState[showNovaDescricao]) {
          newState[showNovaDescricao] = [];
        }
        newState[showNovaDescricao] = [...newState[showNovaDescricao], novaDescricao];
        return newState;
      });

      // Além disso, chama a função de callback
      onAddPredefinido(showNovaDescricao, novaDescricao);
      
      setNovaDescricao('');
      setShowNovaDescricao(null);
      toast.success(`Descrição adicionada a ${showNovaDescricao}`);
    }
  };
  
  const toggleSelection = (nome: string, valor: string) => {
    setSelectedDetails(prev => {
      const newState = { ...prev };
      
      if (newState[nome] === valor) {
        newState[nome] = null; // Desmarca se já estava selecionado
      } else {
        newState[nome] = valor; // Seleciona novo valor
      }
      
      return newState;
    });
  };

  // Função para alternar a expansão da categoria
  const toggleCategory = (nome: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [nome]: !prev[nome]
    }));
  };

  // Função para excluir uma descrição
  const handleRemoveDescricao = (nome: string, valor: string) => {
    // Remove a descrição do estado local
    setDetalhesPredefinidosState(prev => {
      const newState = { ...prev };
      newState[nome] = newState[nome].filter(v => v !== valor);
      return newState;
    });

    // Limpa a seleção se essa descrição estava selecionada
    if (selectedDetails[nome] === valor) {
      setSelectedDetails(prev => {
        const newState = { ...prev };
        delete newState[nome];
        return newState;
      });
    }

    toast.success(`Descrição "${valor}" removida de "${nome}"`);
  };
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-4 shadow-xl z-50 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          {/* Cabeçalho compacto */}
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Adicionar Detalhes
            </Dialog.Title>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Barra de subtítulo e botão - mais compacta */}
          <div className="flex items-center justify-between border-b pb-1 mb-2">
            <h3 className="text-sm font-medium text-gray-800">Detalhes Predefinidos</h3>
            <button 
              onClick={() => setShowNovoDetalhe(!showNovoDetalhe)}
              className="flex items-center gap-0.5 text-xs text-primary hover:text-primary-dark"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Detalhe
            </button>
          </div>

          {showNovoDetalhe && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                placeholder="Nome do detalhe (Ex: Cor)"
              />
              <input
                type="text"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                placeholder="Descrição do detalhe (Ex: Branco)"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddNovo}
                  className="px-2 py-1 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
          
          {/* Área de rolagem com altura máxima aumentada */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            <div className="space-y-2">
              {Object.entries(detalhesPredefinidosState).map(([nome, valores]) => (
                <div key={nome} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Cabeçalho da categoria - clicável para expandir/colapsar */}
                  <div 
                    className={`flex items-center justify-between p-2.5 cursor-pointer hover:bg-gray-100 ${selectedDetails[nome] ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'}`}
                    onClick={() => toggleCategory(nome)}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium">{nome}</span>
                      {selectedDetails[nome] && (
                        <span className="ml-2 text-xs text-blue-600 font-medium bg-blue-100 px-1.5 py-0.5 rounded">
                          {selectedDetails[nome]}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNovaDescricao(nome);
                        setNovaDescricao('');
                      }}
                      className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      + Nova descrição
                    </button>
                  </div>
                  
                  {/* Conteúdo da categoria - visível apenas quando expandido */}
                  {expandedCategories[nome] && (
                    <div className="p-2 border-t border-gray-200">
                      {showNovaDescricao === nome && (
                        <div className="mb-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={novaDescricao}
                            onChange={(e) => setNovaDescricao(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                            placeholder="Nova descrição..."
                          />
                          <button
                            onClick={handleAddNovaDescricao}
                            className="shrink-0 px-1.5 py-1 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNovaDescricao(null);
                            }}
                            className="shrink-0 p-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      
                      <div className="space-y-1.5">
                        {valores.map((valor) => (
                          <div key={valor} className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                                checked={selectedDetails[nome] === valor}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(nome, valor);
                                }}
                              />
                              <span className="text-gray-700">{valor}</span>
                            </label>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDescricao(nome, valor);
                              }}
                              className="p-1 text-gray-500 hover:text-red-500"
                              title="Remover esta descrição"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        
                        {valores.length === 0 && (
                          <p className="text-xs text-gray-500 italic">
                            Nenhuma descrição disponível. Adicione uma nova.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de ação - mais compactos */}
          <div className="mt-2 pt-2 border-t flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddSelecionados}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
            >
              Adicionar Selecionados
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditarDetalheModal({ isOpen, onClose, detalhe, onSave, opcoes }: EditarDetalheModalProps) {
  const [valor, setValor] = useState(detalhe?.valor || '');
  
  useEffect(() => {
    if (isOpen && detalhe) {
      setValor(detalhe.valor);
    }
  }, [isOpen, detalhe]);
  
  const handleSubmit = () => {
    if (!valor.trim()) {
      toast.error("Por favor, informe um valor");
      return;
    }
    
    onSave({ nome: detalhe.nome, valor });
    onClose();
  };
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-xl z-50 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
            Editar {detalhe?.nome}
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                id="valor"
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={`Ex: Cor, Material, Estado...`}
              />
              
              {opcoes && opcoes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {opcoes.map((opcao) => (
                    <button
                      key={opcao}
                      onClick={() => setValor(opcao)}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Salvar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImagemExpandidaModal({ isOpen, onClose, imageUrl, onSave }: ImagemExpandidaModalProps) {
  const [anotacoes, setAnotacoes] = useState("");
  
  useEffect(() => {
    if (isOpen) {
      setAnotacoes("");
    }
  }, [isOpen, imageUrl]);
  
  const handleSave = () => {
    onSave(imageUrl);
    onClose();
  };
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <Dialog.Title className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Visualizar Imagem</h2>
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
          </Dialog.Title>
          
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
            <div className="relative max-w-full max-h-[60vh] overflow-hidden">
              <Image 
                src={imageUrl} 
                alt="Imagem ampliada" 
                width={800}
                height={600}
                className="object-contain"
              />
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Função utilitária para lidar com referências de fotos entre vistoria de entrada e saída
const handleAddFotoComReferencia = (fotoEntradaId: string, descricao: string) => {
  // Esta função era usada para vistorias de saída que não são mais necessárias
  // Mantida como stub para evitar erros, pode ser removida posteriormente
  console.log("handleAddFotoComReferencia não é mais necessária");
};

// Componente para exibir imagem em formato diagonal (não usado mais, mantido como stub)
function DiagonalImageCard(props: DiagonalImageCardProps) {
  // Este componente era usado para vistorias de saída que não são mais necessárias
  // Mantido como stub para evitar erros, pode ser removido posteriormente
  return <div className="hidden">Componente não utilizado</div>;
} 
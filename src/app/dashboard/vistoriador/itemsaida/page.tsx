'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Plus, X, Image as ImageIcon, ChevronRight, Check, AlertTriangle, Pencil, Edit3, Copy, Trash2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Toaster, toast } from 'sonner';

// Definição das interfaces
type EstadoItem = 'novo' | 'bom' | 'regular' | 'ruim';

interface Foto {
  id: string;
  url: string;
  descricao?: string;
  referenciaEntradaId?: string;
}

interface Detalhe {
  id: string;
  nome: string;
  valor: string;
}

interface Item {
  id: string;
  nome: string;
  tipo: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  estado: EstadoItem;
  fotos: Foto[];
  detalhes: Detalhe[];
  observacoes: string;
  ambiente?: string;
}

interface Ambiente {
  id: string;
  nome: string;
  tipo: string;
}

// Interface para dados da vistoria de entrada
interface VistoriaEntrada {
  itens: {
    [itemId: string]: {
      fotos: Foto[];
      observacoes: string;
      detalhes: Detalhe[];
      estado: EstadoItem;
    }
  };
}

// Interface para o modal de adicionar novo item
interface NovoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { nome: string; tipo: string }) => void;
  itemInicial?: { nome: string; tipo: string } | null;
  title?: string;
}

// Interface para o template de item
interface ItemTemplate {
  id: string;
  nome: string;
  tipo: string;
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

// Interface para NovoDetalheModalProps (copiado de TelaItem.tsx)
interface NovoDetalheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (detalhe: Omit<Detalhe, 'id'>) => void;
  detalhesPredefinidos: Record<string, string[]>;
  onAddPredefinido: (nome: string, valor: string) => void;
}

// Componente principal da página de item de vistoria de saída
export default function ItemSaidaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados básicos
  const [loading, setLoading] = useState(true);
  const [vistoriaId, setVistoriaId] = useState<string | null>(null);
  const [ambienteId, setAmbienteId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [nomeAmbiente, setNomeAmbiente] = useState('');
  const [codigoVistoria, setCodigoVistoria] = useState<string | null>(null);
  const [entryInspectionCode, setEntryInspectionCode] = useState<string | null>(null);
  
  // Estado para controlar a tab ativa (sempre presente na vistoria de saída)
  const [vistoriaTab, setVistoriaTab] = useState<'entrada' | 'saida'>('saida');
  
  // Estados para detalhes do item
  const [item, setItem] = useState<Item | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [detalhes, setDetalhes] = useState<Detalhe[]>([]);
  const [estado, setEstado] = useState<EstadoItem>('bom');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Estado para dados de vistoria de entrada
  const [vistoriaEntrada, setVistoriaEntrada] = useState<VistoriaEntrada | null>(null);
  
  // Dados mockados para a vistoria de entrada
  const vistoriaEntradaMock: VistoriaEntrada = {
    itens: {
      // Item de exemplo para a vistoria de entrada
      'item-default': {
        fotos: [
          {
            id: "entrada-foto-item-1",
            url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2F0ZXIlMjB0YXB8ZW58MHx8MHx8fDA%3D",
            descricao: "Foto de entrada do item"
          },
          {
            id: "entrada-foto-item-2",
            url: "https://images.unsplash.com/photo-1575336127377-62031298e1e9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRhcHxlbnwwfHwwfHx8MA%3D%3D",
            descricao: "Outro ângulo do item - entrada"
          }
        ],
        observacoes: "Item em bom estado na vistoria de entrada.",
        detalhes: [
          { id: "detalhe-entrada-1", nome: "Material", valor: "Metal" },
          { id: "detalhe-entrada-2", nome: "Cor", valor: "Cromado" },
          { id: "detalhe-entrada-3", nome: "Marca", valor: "Deca" }
        ],
        estado: "bom"
      }
    }
  };
  
  // Item mockado para exemplo
  const itemMock: Item = {
    id: '1',
    nome: 'Torneira',
    tipo: 'Hidráulica',
    status: 'pendente',
    estado: 'bom',
    fotos: [],
    detalhes: [
      { id: "1", nome: "Material", valor: "Metal" },
      { id: "2", nome: "Cor", valor: "Cromado" }
    ],
    observacoes: "Torneira da pia da cozinha"
  };
  
  // Estados para a sidebar e manipulação de itens
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [itensDoAmbiente, setItensDoAmbiente] = useState<Item[]>([]);
  const [itemParaEditar, setItemParaEditar] = useState<Item | null>(null);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estado para a navegação por tabs
  const [activeTab, setActiveTab] = useState<'fotos' | 'detalhes'>('fotos');
  const [showNovoDetalhe, setShowNovoDetalhe] = useState(false);
  const [editingDetalhe, setEditingDetalhe] = useState<Detalhe | null>(null);
  const [nomeDetalhe, setNomeDetalhe] = useState('');
  const [descricaoDetalhe, setDescricaoDetalhe] = useState('');
  const [detalhesSelecionados, setDetalhesSelecionados] = useState<string[]>([]);
  const [detalhesPredefinidos, setDetalhesPredefinidos] = useState<Record<string, string[]>>({
    'Cor': ['Branco', 'Preto', 'Azul', 'Vermelho', 'Amarelo', 'Verde'],
    'Material': ['Madeira', 'Metal', 'Vidro', 'Plástico', 'Cerâmica', 'Porcelanato'],
    'Estado': ['Novo', 'Seminovo', 'Usado', 'Danificado', 'Em manutenção'],
    'Funcionamento': ['Funcionando', 'Com defeito', 'Não testado']
  });
  
  // Estado para controlar qual botão de comparação está selecionado
  const [comparacaoSelecionada, setComparacaoSelecionada] = useState<'igual' | 'diferente' | null>(null);
  
  // Corrigindo erros de linter
  const [nomeItem, setNomeItem] = useState('');
  const [tipoItem, setTipoItem] = useState('');
  const [novoTipo, setNovoTipo] = useState('');
  const [showNovoTipo, setShowNovoTipo] = useState(false);
  const [mostrarFormularioCriacao, setMostrarFormularioCriacao] = useState(false);
  const [tiposItem, setTiposItem] = useState([
    'Piso',
    'Parede',
    'Teto',
    'Porta',
    'Janela',
    'Tomada'
  ]);
  const [itensTemplates, setItensTemplates] = useState<ItemTemplate[]>([
    { id: '1', nome: 'Piso de Madeira', tipo: 'Piso' },
    { id: '2', nome: 'Parede com Pintura', tipo: 'Parede' },
    { id: '3', nome: 'Torneira', tipo: 'Hidráulica' },
    { id: '4', nome: 'Porta Principal', tipo: 'Porta' },
    { id: '5', nome: 'Janela de Vidro', tipo: 'Janela' },
  ]);
  
  useEffect(() => {
    // Verificar se existem os parâmetros na URL
    const vistoriaIdParam = searchParams?.get('vistoriaId');
    const ambienteIdParam = searchParams?.get('ambienteId');
    const itemIdParam = searchParams?.get('itemId');
    
    // Verificar se temos todos os parâmetros necessários
    if (!ambienteIdParam || !itemIdParam) {
      // Se estiver faltando algum, voltar para a página de ambientes de saída
      if (vistoriaIdParam) {
        const params = new URLSearchParams();
        params.append('vistoriaId', vistoriaIdParam);
        router.push(`/dashboard/vistoriador/ambientesaida?${params.toString()}`);
      } else {
        router.push('/dashboard/vistoriador/ambientesaida');
      }
      return;
    }
    
    // Armazenar os IDs
    if (vistoriaIdParam) {
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
        console.log("ItemSaida - useEffect - Vistoria atualizada no localStorage:", vistoriaAtivaObj);
      } catch (error) {
        console.error('Erro ao atualizar vistoriaAtiva no localStorage:', error);
      }
    }
    setAmbienteId(ambienteIdParam);
    setItemId(itemIdParam);
    
    // Carregar informações da vistoria de saída do localStorage
    try {
      const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
      if (vistoriaAtivaString) {
        const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
        if (vistoriaAtiva && vistoriaAtiva.tipoVistoria === 'saida') {
          if (vistoriaAtiva.entryInspectionCode) {
            setEntryInspectionCode(vistoriaAtiva.entryInspectionCode);
          } else {
            setEntryInspectionCode("VS-2023-001"); // Código padrão como fallback
          }
          
          // Simular carregamento dos dados de vistoria de entrada
          setVistoriaEntrada(vistoriaEntradaMock);
          setCodigoVistoria(vistoriaAtiva.id);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar vistoria ativa:', error);
    }
    
    // Buscar informações do ambiente do localStorage
    try {
      const ambientesArmazenados = localStorage.getItem('ambientes');
      if (ambientesArmazenados) {
        const ambientesParsed = JSON.parse(ambientesArmazenados);
        const ambienteEncontrado = ambientesParsed.find((amb: any) => amb.id === ambienteIdParam);
        if (ambienteEncontrado) {
          setNomeAmbiente(ambienteEncontrado.nome);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar informações do ambiente:', error);
    }
    
    // Buscar informações do item e todos os itens do ambiente do localStorage
    try {
      const itensArmazenados = localStorage.getItem('itens');
      if (itensArmazenados) {
        const itensParsed = JSON.parse(itensArmazenados);
        
        // Primeiro carregar todos os itens do ambiente atual
        const itensDoAmbienteAtual = itensParsed.filter((i: Item) => i.ambiente === ambienteIdParam);
        setItensDoAmbiente(itensDoAmbienteAtual);
        console.log("Itens do ambiente carregados:", itensDoAmbienteAtual);
        
        // Depois encontrar o item específico pelo ID
        const itemEncontrado = itensParsed.find((i: any) => i.id === itemIdParam);
        if (itemEncontrado) {
          console.log("Item específico encontrado:", itemEncontrado);
          setItem(itemEncontrado);
          setFotos(itemEncontrado.fotos || []);
          setObservacoes(itemEncontrado.observacoes || '');
          setDetalhes(itemEncontrado.detalhes || []);
          setEstado(itemEncontrado.estado || 'bom');
        } else {
          console.log("Item específico não encontrado, usando mock:", itemMock);
          // Se não encontrar, usar mock
          setItem(itemMock);
          setFotos(itemMock.fotos);
          setObservacoes(itemMock.observacoes);
          setDetalhes(itemMock.detalhes);
          setEstado(itemMock.estado);
        }
      } else {
        console.log("Nenhum item armazenado, usando mock:", itemMock);
        // Se não houver itens no localStorage, usar mock
        setItem(itemMock);
        setFotos(itemMock.fotos);
        setObservacoes(itemMock.observacoes);
        setDetalhes(itemMock.detalhes);
        setEstado(itemMock.estado);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do item:', error);
      // Em caso de erro, usar mock
      setItem(itemMock);
      setFotos(itemMock.fotos);
      setObservacoes(itemMock.observacoes);
      setDetalhes(itemMock.detalhes);
      setEstado(itemMock.estado);
    }
    
    setLoading(false);
  }, [router, searchParams]);
  
  // UseEffect adicional para atualizar a interface quando o itemId mudar
  useEffect(() => {
    if (!itemId) return;
    
    console.log("useEffect para itemId - Detectada mudança no itemId para:", itemId);
    
    // Buscar informações do item no localStorage
    try {
      const itensArmazenados = localStorage.getItem('itens');
      if (itensArmazenados) {
        const itensParsed = JSON.parse(itensArmazenados);
        const itemEncontrado = itensParsed.find((i: any) => i.id === itemId);
        
        if (itemEncontrado) {
          console.log("useEffect para itemId - Item encontrado:", itemEncontrado);
          
          // Atualizar os estados com as informações do item
          setItem(itemEncontrado);
          setFotos(itemEncontrado.fotos || []);
          setObservacoes(itemEncontrado.observacoes || '');
          setDetalhes(itemEncontrado.detalhes || []);
          setEstado(itemEncontrado.estado || 'bom');
        } else {
          console.warn("useEffect para itemId - Item não encontrado no localStorage:", itemId);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar item atualizado:", error);
    }
  }, [itemId]); // Executar sempre que itemId mudar
  
  // UseEffect para gerenciar mudanças na aba de vistoria (entrada/saída)
  useEffect(() => {
    console.log("useEffect para vistoriaTab - Tab alterada para:", vistoriaTab);
    
    if (vistoriaTab === 'entrada') {
      // Verificar se temos dados de vistoria de entrada
      if (!vistoriaEntrada) {
        console.warn("Dados de vistoria de entrada não disponíveis");
        return;
      }
      
      // Forçar uma atualização da interface
      const entradaFotos = getFotosPorTab();
      const entradaObservacoes = getObservacoesPorTab();
      const entradaDetalhes = getDetalhesPorTab();
      const entradaEstado = getEstadoPorTab();
      
      console.log("useEffect para vistoriaTab - Dados da vistoria de entrada carregados:", {
        fotos: entradaFotos,
        observacoes: entradaObservacoes,
        detalhes: entradaDetalhes,
        estado: entradaEstado
      });
    } else {
      // Voltar para os dados do item atual (saída)
      if (!item) {
        console.warn("Item atual não disponível");
        return;
      }
      
      console.log("useEffect para vistoriaTab - Voltando para dados do item atual:", {
        fotos: item.fotos || [],
        observacoes: item.observacoes || '',
        detalhes: item.detalhes || [],
        estado: item.estado || 'bom'
      });
    }
  }, [vistoriaTab]); // Executar sempre que a aba vistoriaTab mudar
  
  // Função para voltar para a página de ambiente
  const handleVoltar = () => {
    const params = new URLSearchParams();
    
    // Verificar se temos os parâmetros na URL atual
    const vistoriaIdParam = searchParams?.get('vistoriaId');
    const ambienteIdParam = searchParams?.get('ambienteId');
    
    // Debug para rastrear o fluxo de navegação
    console.log("ItemSaida - handleVoltar - vistoriaId (estado):", vistoriaId);
    console.log("ItemSaida - handleVoltar - vistoriaId (URL):", vistoriaIdParam);
    console.log("ItemSaida - handleVoltar - ambienteId (estado):", ambienteId);
    console.log("ItemSaida - handleVoltar - ambienteId (URL):", ambienteIdParam);
    
    // Priorizar os parâmetros da URL
    if (vistoriaIdParam) {
      params.append('vistoriaId', vistoriaIdParam);
    } else if (vistoriaId) {
      params.append('vistoriaId', vistoriaId);
    } else {
      // Se não tiver em nenhum dos locais, tenta buscar do localStorage
      try {
        const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
        if (vistoriaAtivaString) {
          const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
          console.log("ItemSaida - handleVoltar - vistoriaAtiva do localStorage:", vistoriaAtiva);
          if (vistoriaAtiva && vistoriaAtiva.id) {
            params.append('vistoriaId', vistoriaAtiva.id);
          }
        }
      } catch (error) {
        console.error('Erro ao recuperar vistoriaAtiva do localStorage:', error);
      }
    }
    
    // Adicionar ambienteId se disponível (priorizar o da URL)
    if (ambienteIdParam) {
      params.append('ambienteId', ambienteIdParam);
    } else if (ambienteId) {
      params.append('ambienteId', ambienteId);
    }
    
    // Navegar para a tela ambientesaida garantindo que o parâmetro vistoriaId esteja presente
    if (params.has('vistoriaId')) {
      const url = `/dashboard/vistoriador/ambientesaida?${params.toString()}`;
      console.log("ItemSaida - handleVoltar - Navegando para:", url);
      router.push(url);
    } else {
      // Caso não consiga recuperar o vistoriaId, voltar para a tela de capavistoriasaida
      console.log("ItemSaida - handleVoltar - Navegando para capavistoriasaida por falta de vistoriaId");
      router.push('/dashboard/vistoriador/capavistoriasaida');
    }
  };
  
  // Função para adicionar nova foto
  const handleAddFoto = () => {
    fileInputRef.current?.click();
  };
  
  // Função para processar o arquivo selecionado
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !item) return;
    
    // Verificar se estamos adicionando uma foto com referência (diagonal)
    const referenciaEntradaId = localStorage.getItem('referenciaEntradaId');
    
    // Processar arquivos selecionados
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          // Criar nova foto
          const novaFoto: Foto = {
            id: Math.random().toString(),
            url: result,
            descricao: 'Nova foto'
          };
          
          // Se tiver referência (foi clicado na diagonal), adicionar o ID da referência
          if (referenciaEntradaId) {
            novaFoto.referenciaEntradaId = referenciaEntradaId;
            // Limpar o referencia ID do localStorage após uso
            localStorage.removeItem('referenciaEntradaId');
            console.log("Foto diagonal adicionada com referência:", referenciaEntradaId);
          }
          
          // Adicionar à lista de fotos
          const fotosAtualizadas = [...fotos, novaFoto];
          setFotos(fotosAtualizadas);
          
          // Atualizar o item no localStorage
          const itemAtualizado = { ...item, fotos: fotosAtualizadas };
          atualizarItemNoLocalStorage(itemAtualizado);
          
          toast.success(referenciaEntradaId 
            ? 'Foto de comparação adicionada com sucesso!' 
            : 'Foto adicionada com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };
  
  // Função para adicionar uma foto com referência à foto de entrada
  const handleAddFotoComReferencia = (fotoEntradaId: string, descricao?: string) => {
    if (!fileInputRef.current || !item) return;
    
    // Armazenar o ID da referência temporariamente no localStorage para recuperá-lo
    // após a seleção do arquivo
    localStorage.setItem('referenciaEntradaId', fotoEntradaId);
    
    // Abrir o seletor de arquivos
    fileInputRef.current.click();
  };
  
  // Função para atualizar as observações
  const handleUpdateObservacoes = (texto: string) => {
    setObservacoes(texto);
    
    // Atualizar o item no localStorage, se necessário
    if (item) {
      const itemAtualizado = { ...item, observacoes: texto };
      atualizarItemNoLocalStorage(itemAtualizado);
    }
  };
  
  // Função para atualizar o estado do item
  const handleUpdateEstado = (novoEstado: EstadoItem) => {
    setEstado(novoEstado);
    
    // Atualizar o item no localStorage, se necessário
    if (item) {
      const itemAtualizado = { ...item, estado: novoEstado };
      atualizarItemNoLocalStorage(itemAtualizado);
    }
  };
  
  // Função auxiliar para atualizar o item no localStorage
  const atualizarItemNoLocalStorage = (itemAtualizado: Item) => {
    try {
      // Atualizar o estado local primeiro
      setItem(itemAtualizado);
      setFotos(itemAtualizado.fotos || []);
      setObservacoes(itemAtualizado.observacoes || '');
      setDetalhes(itemAtualizado.detalhes || []);
      setEstado(itemAtualizado.estado || 'bom');
      
      console.log("atualizarItemNoLocalStorage - Item atualizado no estado:", itemAtualizado);
      
      // Depois atualizar no localStorage
      const itensArmazenados = localStorage.getItem('itens');
      if (itensArmazenados) {
        const itensParsed = JSON.parse(itensArmazenados);
        const itensAtualizados = itensParsed.map((i: Item) => 
          i.id === itemAtualizado.id ? itemAtualizado : i
        );
        
        // Atualizar a lista de itens do ambiente
        const itensDoAmbienteAtualizado = itensAtualizados.filter(
          (i: Item) => i.ambiente === ambienteId
        );
        setItensDoAmbiente(itensDoAmbienteAtualizado);
        
        localStorage.setItem('itens', JSON.stringify(itensAtualizados));
        console.log("atualizarItemNoLocalStorage - Itens atualizados no localStorage:", itensAtualizados);
        console.log("atualizarItemNoLocalStorage - Itens do ambiente atualizados:", itensDoAmbienteAtualizado);
      } else {
        // Se não houver itens no localStorage, criar nova lista
        localStorage.setItem('itens', JSON.stringify([itemAtualizado]));
        setItensDoAmbiente([itemAtualizado]); // Atualizar também a lista local
        console.log("atualizarItemNoLocalStorage - Criado novo array de itens no localStorage");
      }
    } catch (error) {
      console.error('Erro ao atualizar item no localStorage:', error);
    }
  };
  
  // Função para obter as fotos com base na aba selecionada
  const getFotosPorTab = () => {
    // Log para debug
    console.log("getFotosPorTab - vistoriaTab:", vistoriaTab);
    console.log("getFotosPorTab - item:", item);
    console.log("getFotosPorTab - vistoriaEntrada:", vistoriaEntrada);
    
    if (vistoriaTab === 'entrada') {
      // Para a aba Entrada, mostrar fotos da vistoria de entrada
      if (item && vistoriaEntrada?.itens[item.id]) {
        console.log("getFotosPorTab - usando fotos específicas do item na vistoria de entrada");
        return vistoriaEntrada.itens[item.id].fotos;
      } else {
        // Se não encontrar, usar item padrão como exemplo
        console.log("getFotosPorTab - usando fotos de exemplo da vistoria de entrada");
        return vistoriaEntrada?.itens['item-default']?.fotos || [];
      }
    } else {
      // Para a aba Saída, mostrar fotos do item atual
      console.log("getFotosPorTab - usando fotos do item atual (saída):", fotos);
      return fotos;
    }
  };
  
  // Função para obter as observações com base na aba selecionada
  const getObservacoesPorTab = () => {
    // Log para debug
    console.log("getObservacoesPorTab - vistoriaTab:", vistoriaTab);
    console.log("getObservacoesPorTab - item:", item);
    
    if (vistoriaTab === 'entrada') {
      // Para a aba Entrada, mostrar observações da vistoria de entrada
      if (item && vistoriaEntrada?.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].observacoes;
      } else {
        // Se não encontrar, usar item padrão como exemplo
        return vistoriaEntrada?.itens['item-default']?.observacoes || 'Sem observações na vistoria de entrada.';
      }
    } else {
      // Para a aba Saída, mostrar observações do item atual
      return observacoes;
    }
  };
  
  // Função para obter o estado com base na aba selecionada
  const getEstadoPorTab = () => {
    if (vistoriaTab === 'entrada') {
      // Para a aba Entrada, mostrar estado da vistoria de entrada
      if (item && vistoriaEntrada?.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].estado;
      } else {
        // Se não encontrar, usar item padrão como exemplo
        return vistoriaEntrada?.itens['item-default']?.estado || 'bom';
      }
    } else {
      // Para a aba Saída, mostrar estado do item atual
      return estado;
    }
  };
  
  // Função para obter os detalhes com base na aba selecionada
  const getDetalhesPorTab = () => {
    if (vistoriaTab === 'entrada') {
      // Para a aba Entrada, mostrar detalhes da vistoria de entrada
      if (item && vistoriaEntrada?.itens[item.id]) {
        return vistoriaEntrada.itens[item.id].detalhes;
      } else {
        // Se não encontrar, usar item padrão como exemplo
        return vistoriaEntrada?.itens['item-default']?.detalhes || [];
      }
    } else {
      // Para a aba Saída, mostrar detalhes do item atual
      return detalhes;
    }
  };
  
  // Funções para gerenciar a seleção e manipulação de itens
  const handleLongPress = (item: Item) => {
    setModoSelecao(true);
    toggleSelecaoItem(item.id);
  };
  
  const handleTouchStart = (item: Item) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(item);
      longPressTimerRef.current = null;
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
  
  const handleMouseDown = (item: Item) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(item);
      longPressTimerRef.current = null;
    }, 500);
  };
  
  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  const handleCardClick = (item: Item) => {
    if (modoSelecao) {
      toggleSelecaoItem(item.id);
    } else {
      // Atualizar o item selecionado e todos os estados relacionados
      setItem(item);
      setFotos(item.fotos || []);
      setObservacoes(item.observacoes || '');
      setDetalhes(item.detalhes || []);
      setEstado(item.estado || 'bom');
      
      // Adicionar log para debug
      console.log("Item selecionado atualizado:", item);
      console.log("Fotos:", item.fotos || []);
      console.log("Detalhes:", item.detalhes || []);
      console.log("Estado:", item.estado || 'bom');
      
      // Atualizar a URL para refletir o item selecionado
      const params = new URLSearchParams(window.location.search);
      params.set('itemId', item.id);
      
      // Manter os outros parâmetros existentes
      if (vistoriaId) params.set('vistoriaId', vistoriaId);
      if (ambienteId) params.set('ambienteId', ambienteId);
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
      
      // Atualizar o itemId no estado
      setItemId(item.id);
    }
  };
  
  const handleDragStart = (item: Item) => {
    setDraggedItem(item);
    setIsDragging(true);
  };
  
  const handleDragOver = (targetItem: Item) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const newItens = [...itensDoAmbiente];
    const draggedIndex = newItens.findIndex(i => i.id === draggedItem.id);
    const targetIndex = newItens.findIndex(i => i.id === targetItem.id);
    
    const [removed] = newItens.splice(draggedIndex, 1);
    newItens.splice(targetIndex, 0, removed);
    
    setItensDoAmbiente(newItens);
    
    // Salvar a nova ordem no localStorage
    const itensArmazenados = localStorage.getItem('itens');
    if (itensArmazenados) {
      const itensParsed = JSON.parse(itensArmazenados);
      const itensAtualizados = itensParsed.map((i: Item) => 
        newItens.find(ni => ni.id === i.id) || i
      );
      localStorage.setItem('itens', JSON.stringify(itensAtualizados));
    }
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };
  
  const handleEditarItem = (item: Item) => {
    setItemParaEditar(item);
    setShowNovoItem(true);
    setModoSelecao(false);
  };
  
  const handleEditarItemClick = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    handleEditarItem(item);
  };
  
  const handleDuplicarItem = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const novoItem: Item = {
      ...item,
      id: Math.random().toString(),
      nome: `${item.nome} (Cópia)`,
    };
    
    const itensAtualizados = [...itensDoAmbiente, novoItem];
    setItensDoAmbiente(itensAtualizados);
    
    // Salvar no localStorage
    const itensArmazenados = localStorage.getItem('itens');
    if (itensArmazenados) {
      const itensParsed = JSON.parse(itensArmazenados);
      const todosItensAtualizados = [...itensParsed, novoItem];
      localStorage.setItem('itens', JSON.stringify(todosItensAtualizados));
    }
    
    toast.success(`Item "${item.nome}" duplicado com sucesso!`);
  };
  
  const handleExcluirItem = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.id === itemId) {
      setItem(null);
    }
    
    const itensAtualizados = itensDoAmbiente.filter(i => i.id !== item.id);
    setItensDoAmbiente(itensAtualizados);
    
    // Salvar no localStorage
    const itensArmazenados = localStorage.getItem('itens');
    if (itensArmazenados) {
      const itensParsed = JSON.parse(itensArmazenados);
      const todosItensAtualizados = itensParsed.filter((i: Item) => i.id !== item.id);
      localStorage.setItem('itens', JSON.stringify(todosItensAtualizados));
    }
    
    toast.success(`Item "${item.nome}" excluído com sucesso!`);
  };
  
  const sairDoModoSelecao = () => {
    setModoSelecao(false);
    setItensSelecionados([]);
  };
  
  const handleExcluirSelecionados = () => {
    const itensRestantes = itensDoAmbiente.filter(i => !itensSelecionados.includes(i.id));
    setItensDoAmbiente(itensRestantes);
    
    // Se o item atual foi excluído, limpar seleção
    if (item && itensSelecionados.includes(item.id)) {
      setItem(null);
    }
    
    // Salvar no localStorage
    const itensArmazenados = localStorage.getItem('itens');
    if (itensArmazenados) {
      const itensParsed = JSON.parse(itensArmazenados);
      const todosItensAtualizados = itensParsed.filter((i: Item) => !itensSelecionados.includes(i.id));
      localStorage.setItem('itens', JSON.stringify(todosItensAtualizados));
    }
    
    toast.success(`${itensSelecionados.length} item(s) excluído(s) com sucesso!`);
    sairDoModoSelecao();
  };
  
  const toggleSelecaoItem = (itemId: string) => {
    setItensSelecionados(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const handleAddItemSubmit = (novoItem: { nome: string; tipo: string }) => {
    const item: Item = {
      id: Math.random().toString(),
      nome: novoItem.nome,
      tipo: novoItem.tipo,
      status: 'pendente',
      estado: 'bom',
      fotos: [],
      detalhes: [],
      observacoes: '',
      ambiente: ambienteId || undefined
    };
    
    // Adicionar o item à lista
    const itensAtualizados = [...itensDoAmbiente, item];
    setItensDoAmbiente(itensAtualizados);
    
    // Salvar no localStorage
    const itensArmazenados = localStorage.getItem('itens');
    if (itensArmazenados) {
      const itensParsed = JSON.parse(itensArmazenados);
      const todosItensAtualizados = [...itensParsed, item];
      localStorage.setItem('itens', JSON.stringify(todosItensAtualizados));
    } else {
      localStorage.setItem('itens', JSON.stringify([item]));
    }
    
    toast.success(`Item "${item.nome}" adicionado com sucesso!`);
  };
  
  // Efeito para carregar os itens do ambiente
  useEffect(() => {
    if (ambienteId) {
      try {
        const itensArmazenados = localStorage.getItem('itens');
        if (itensArmazenados) {
          const itensParsed = JSON.parse(itensArmazenados);
          const itensFiltrados = itensParsed.filter((i: Item) => i.ambiente === ambienteId);
          setItensDoAmbiente(itensFiltrados);
        }
      } catch (error) {
        console.error('Erro ao carregar itens do ambiente:', error);
      }
    }
  }, [ambienteId]);
  
  // Função para adicionar um detalhe
  const handleAddDetalhe = (novoDetalhe: Omit<Detalhe, 'id'>) => {
    if (!item) return;
    
    const novoId = Math.random().toString();
    const detalheCompleto: Detalhe = {
      id: novoId,
      ...novoDetalhe
    };
    
    const detalhesAtualizados = [...detalhes, detalheCompleto];
    setDetalhes(detalhesAtualizados);
    
    const itemAtualizado = { ...item, detalhes: detalhesAtualizados };
    atualizarItemNoLocalStorage(itemAtualizado);
    
    toast.success('Detalhe adicionado com sucesso!');
  };
  
  // Função para adicionar detalhe predefinido
  const handleAddPredefinido = (nome: string, valor: string) => {
    setDetalhesPredefinidos(prev => {
      const novosPredefinidos = { ...prev };
      if (!novosPredefinidos[nome]) {
        novosPredefinidos[nome] = [];
      }
      if (!novosPredefinidos[nome].includes(valor) && valor) {
        novosPredefinidos[nome] = [...novosPredefinidos[nome], valor];
      }
      return novosPredefinidos;
    });
  };
  
  const toggleDetalhe = (categoria: string) => {
    setDetalhesSelecionados(prev => 
      prev.includes(categoria)
        ? prev.filter(d => d !== categoria)
        : [...prev, categoria]
    );
  };

  const handleEditDetalhe = (detalheId: string) => {
    const detalhe = detalhes.find(d => d.id === detalheId);
    if (detalhe) {
      setEditingDetalhe(detalhe);
      setShowNovoDetalhe(true);
    }
  };

  const handleDeleteDetalhe = (detalheId: string) => {
    if (!item) return;
    
    const detalhesAtualizados = detalhes.filter(d => d.id !== detalheId);
    setDetalhes(detalhesAtualizados);
    
    const itemAtualizado = { ...item, detalhes: detalhesAtualizados };
    atualizarItemNoLocalStorage(itemAtualizado);
    
    toast.success('Detalhe excluído com sucesso!');
  };
  
  // Função para configurar o estado de comparação com a entrada
  const handleComparacaoClick = (tipo: 'igual' | 'diferente') => {
    // Se já estava selecionado, remove a seleção, senão seleciona este
    const novoEstado = comparacaoSelecionada === tipo ? null : tipo;
    setComparacaoSelecionada(novoEstado);
    
    if (item) {
      // Atualizar item no localStorage
      const itemAtualizado = { 
        ...item, 
        comparacaoEntradaSaida: novoEstado 
      };
      atualizarItemNoLocalStorage(itemAtualizado);
      
      // Feedback para o usuário
      if (novoEstado === 'igual') {
        toast.success('Item marcado como igual ao da vistoria de entrada');
      } else if (novoEstado === 'diferente') {
        toast.info('Item marcado como diferente do da vistoria de entrada');
      }
    }
  };
  
  // Funções adicionais para corrigir erros de linter
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
  
  const handleAdicionarItensSelecionados = () => {
    // Adicionar todos os itens selecionados
    itensSelecionados.forEach(id => {
      const item = itensTemplates.find(item => item.id === id);
      if (item) {
        handleAddItemSubmit({
          nome: item.nome,
          tipo: item.tipo
        });
      }
    });
    
    // Limpa a seleção
    setItensSelecionados([]);
    
    // Fecha o modal
    setShowNovoItem(false);
  };
  
  const handleExcluirItemTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique ative a seleção do item
    setItensTemplates(prev => prev.filter(item => item.id !== id));
    setItensSelecionados(prev => prev.filter(itemId => itemId !== id));
  };
  
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
      {/* Lista de Itens (Sidebar Esquerda) */}
      <aside className="w-52 bg-white border-r border-border h-screen fixed left-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {nomeAmbiente ? `Itens - ${nomeAmbiente}` : "Itens"}
            </h2>
            {modoSelecao && (
              <button
                onClick={sairDoModoSelecao}
                className="p-1.5 text-primary hover:text-white hover:bg-primary rounded-full transition-colors"
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
            {itensDoAmbiente.map((itemObj) => (
              <div
                key={itemObj.id}
                draggable={modoSelecao}
                onDragStart={() => handleDragStart(itemObj)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(itemObj);
                }}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(itemObj)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={() => handleMouseDown(itemObj)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => handleCardClick(itemObj)}
                className={`w-full p-3 rounded-lg text-left transition-colors relative ${
                  item?.id === itemObj.id
                    ? 'bg-primary/5 border-2 border-primary'
                    : itensSelecionados.includes(itemObj.id)
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
                    <span className="font-medium text-gray-900">{itemObj.nome}</span>
                    <span className="text-xs text-gray-500">{itemObj.tipo}</span>
                  </div>
                </div>
                
                {/* Ícones de ação que aparecem quando o modo de seleção está ativo */}
                {itensSelecionados.includes(itemObj.id) && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 rounded-full px-1 py-0.5">
                    <button
                      onClick={(e) => handleEditarItemClick(itemObj, e)}
                      className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                      title="Editar item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicarItem(itemObj, e)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Duplicar item"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleExcluirItem(itemObj, e)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {itensDoAmbiente.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Nenhum item neste ambiente</p>
                <p className="text-gray-400 text-xs mt-1">Adicione itens usando o botão abaixo</p>
              </div>
            )}
          </div>
        </div>

        {/* Botão Adicionar Item */}
        <button
          onClick={() => {
            setShowNovoItem(true);
            setItemParaEditar(null);
          }}
          className="fixed bottom-6 left-6 w-12 h-12 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Adicionar novo item"
        >
          <Plus className="w-6 h-6" />
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 pl-52 pr-48">
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
                  {item?.nome || 'Detalhes do Item'}
                </h1>
              </div>
              
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
          {/* Tabs Entrada/Saída - SEMPRE VISÍVEL (não depende de ehVistoriaSaida) */}
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

          {activeTab === 'fotos' ? (
            <>
              {/* Área de Fotos */}
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fotos do Item</h2>
                  
                  {/* Removendo o botão "+Adicionar" - comentando a condição inteira */}
                  {/* 
                  {vistoriaTab === 'saida' && (
                    <button
                      onClick={handleAddFoto}
                      className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  )}
                  */}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Condicionalmente exibir fotos de acordo com a tab selecionada */}
                  {vistoriaTab === 'entrada' ? (
                    // Exibe fotos da vistoria de entrada para o item selecionado
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
                    // Exibe fotos da vistoria atual (saída), incluindo as imagens diagonais
                    <>
                      {/* Fotos sem referência da vistoria de saída */}
                      {item?.fotos.filter(foto => !foto.referenciaEntradaId).map((foto) => (
                        <div
                          key={foto.id}
                          className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative group"
                        >
                          <img
                            src={foto.url}
                            alt={foto.descricao || 'Foto do item'}
                            className="w-full h-full object-cover"
                          />
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Deseja excluir esta foto?')) {
                                if (!item) return;
                                const fotosAtualizadas = item.fotos.filter(f => f.id !== foto.id);
                                const itemAtualizado = { ...item, fotos: fotosAtualizadas };
                                
                                atualizarItemNoLocalStorage(itemAtualizado);
                                setFotos(fotosAtualizadas);
                                setItem(itemAtualizado);
                                
                                toast.success('Foto excluída com sucesso!');
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Imagens de referência da entrada com suas respectivas imagens de saída (formato diagonal) */}
                      {vistoriaEntrada?.itens['item-default'].fotos.map(fotoEntrada => {
                        // Procura se já existe uma foto de saída que referencia esta foto de entrada
                        const fotoSaida = item?.fotos.find(
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
                              if (confirm('Deseja excluir esta foto?')) {
                                if (!item) return;
                                const fotosAtualizadas = item.fotos.filter(f => f.id !== fotoSaida.id);
                                const itemAtualizado = { ...item, fotos: fotosAtualizadas };
                                
                                atualizarItemNoLocalStorage(itemAtualizado);
                                setFotos(fotosAtualizadas);
                                setItem(itemAtualizado);
                                
                                toast.success('Foto excluída com sucesso!');
                              }
                            } : undefined}
                          />
                        );
                      })}
                      
                      {/* Botão para adicionar novas fotos sem referência */}
                      <button
                        onClick={handleAddFoto}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all"
                        title="Adicionar nova foto do item"
                      >
                        <Plus className="w-8 h-8 text-gray-400 hover:text-primary mb-2 transition-colors" />
                        <span className="text-sm text-gray-500 font-medium">Adicionar foto</span>
                        <span className="text-xs text-gray-400 mt-1">Clique para selecionar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Área de Observações */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações do Item</h2>
                
                {vistoriaTab === 'entrada' ? (
                  // Texto somente leitura para aba "entrada"
                  <div className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 min-h-[100px]">
                    {getObservacoesPorTab()}
                  </div>
                ) : (
                  <>
                    {/* Campo editável para aba "saída" */}
                    <textarea
                      value={getObservacoesPorTab()}
                      onChange={(e) => handleUpdateObservacoes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Adicione observações sobre este item..."
                    />
                    
                    {/* Botões de comparação - somente na aba "saída" */}
                    <div className="flex gap-3 mt-4 justify-center">
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
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Detalhes (código existente para a tab de detalhes) */}
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Detalhes do Item</h2>
                  
                  {/* Botão para adicionar detalhes - apenas visível na aba de saída */}
                  {vistoriaTab === 'saida' && (
                    <button
                      onClick={() => setShowNovoDetalhe(true)}
                      className="text-sm text-primary hover:text-primary-light transition-colors"
                    >
                      Adicionar Detalhe
                    </button>
                  )}
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
                        
                        {/* Ações de edição/exclusão - apenas visíveis na aba de saída */}
                        {vistoriaTab === 'saida' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditDetalhe(detalhe.id)}
                              className="text-gray-500 hover:text-primary transition-colors p-1"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDetalhe(detalhe.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors p-1"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700">{detalhe.valor}</p>
                    </div>
                  ))}
                  
                  {/* Mensagem quando não há detalhes */}
                  {getDetalhesPorTab().length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-500">
                      {vistoriaTab === 'entrada'
                        ? 'Não há detalhes registrados na vistoria de entrada'
                        : 'Nenhum detalhe adicionado para este item'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Estado do Item (Sidebar Direita) - Adicionando a sidebar direita */}
      <aside className="w-48 bg-white border-l border-border h-screen fixed right-0 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado do Item</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleUpdateEstado('novo')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                getEstadoPorTab() === 'novo'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              } ${vistoriaTab === 'entrada' ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={vistoriaTab === 'entrada'}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="font-medium text-gray-900">Novo</span>
            </button>
            <button
              onClick={() => handleUpdateEstado('bom')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                getEstadoPorTab() === 'bom'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              } ${vistoriaTab === 'entrada' ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={vistoriaTab === 'entrada'}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-gray-900">Bom</span>
            </button>
            <button
              onClick={() => handleUpdateEstado('regular')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                getEstadoPorTab() === 'regular'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              } ${vistoriaTab === 'entrada' ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={vistoriaTab === 'entrada'}
            >
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="font-medium text-gray-900">Regular</span>
            </button>
            <button
              onClick={() => handleUpdateEstado('ruim')}
              className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                getEstadoPorTab() === 'ruim'
                  ? 'bg-primary/5 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              } ${vistoriaTab === 'entrada' ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={vistoriaTab === 'entrada'}
            >
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-medium text-gray-900">Ruim</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Input escondido para seleção de arquivos */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*"
        multiple
      />
      
      {/* Modal para visualizar imagem */}
      {selectedImage && (
        <Dialog.Root open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Visualizar Imagem</h3>
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
                  <img 
                    src={selectedImage} 
                    alt="Imagem ampliada" 
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      
      {/* Modal para adicionar novo item */}
      {showNovoItem && (
        <NovoItemModal 
          isOpen={showNovoItem}
          onClose={() => {
            setShowNovoItem(false);
            setItemParaEditar(null);
          }}
          onAdd={handleAddItemSubmit}
          itemInicial={itemParaEditar ? { nome: itemParaEditar.nome, tipo: itemParaEditar.tipo } : undefined}
          title={itemParaEditar ? 'Editar Item' : 'Adicionar Novo Item'}
        />
      )}
      
      {/* Modal para adicionar detalhes - NOVO */}
      {showNovoDetalhe && (
        <NovoDetalheModal 
          isOpen={showNovoDetalhe}
          onClose={() => setShowNovoDetalhe(false)}
          onAdd={handleAddDetalhe}
          detalhesPredefinidos={detalhesPredefinidos}
          onAddPredefinido={handleAddPredefinido}
        />
      )}
      
      <Toaster position="top-center" />
    </div>
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
            className="w-full h-full flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer relative overflow-hidden"
            title="Adicionar foto de comparação"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute bottom-2 left-2 right-2 h-16 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
                <Camera className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs text-gray-700 font-medium">Adicionar comparação</span>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// Componente do modal de novo item
function NovoItemModal({ isOpen, onClose, onAdd, itemInicial, title = 'Adicionar Novo Item' }: NovoItemModalProps) {
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
  
  // Estados para os templates de itens
  const [mostrarFormularioCriacao, setMostrarFormularioCriacao] = useState(false);
  const [itensTemplates, setItensTemplates] = useState<ItemTemplate[]>([
    { id: '1', nome: 'Piso de Madeira', tipo: 'Piso' },
    { id: '2', nome: 'Parede com Pintura', tipo: 'Parede' },
    { id: '3', nome: 'Torneira', tipo: 'Hidráulica' },
    { id: '4', nome: 'Porta Principal', tipo: 'Porta' },
    { id: '5', nome: 'Janela de Vidro', tipo: 'Janela' },
  ]);
  const [itensSelecionadosModal, setItensSelecionadosModal] = useState<string[]>([]);

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
    setItensSelecionadosModal(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };
  
  // Função para adicionar os itens selecionados
  const handleAdicionarItensSelecionados = () => {
    // Adicionar todos os itens selecionados
    itensSelecionadosModal.forEach(id => {
      const item = itensTemplates.find(item => item.id === id);
      if (item) {
        onAdd({
          nome: item.nome,
          tipo: item.tipo
        });
      }
    });
    
    // Limpa a seleção
    setItensSelecionadosModal([]);
    
    // Fecha o modal
    onClose();
  };
  
  // Função para excluir um item template
  const handleExcluirItemTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique ative a seleção do item
    setItensTemplates(prev => prev.filter(item => item.id !== id));
    setItensSelecionadosModal(prev => prev.filter(itemId => itemId !== id));
  };

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
              <h3 className="text-lg font-medium text-gray-800 mb-4">Selecione um ou mais itens pré-definidos:</h3>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {itensTemplates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelecaoItem(item.id)}
                    className={`p-3 rounded-lg border cursor-pointer relative ${
                      itensSelecionadosModal.includes(item.id)
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
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
                    {itensSelecionadosModal.includes(item.id) && (
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
                          {tiposItem.map((tipo: string) => (
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
                onClick={() => onClose()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarItensSelecionados}
                disabled={itensSelecionadosModal.length === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar {itensSelecionadosModal.length > 0 ? `(${itensSelecionadosModal.length})` : ''}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Função para o modal de detalhes (copiado de TelaItem.tsx e adaptado)
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
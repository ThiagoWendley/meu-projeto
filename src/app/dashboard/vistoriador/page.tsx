'use client';

import { useState, useRef, useEffect } from 'react';
import SidebarVistoriador from '../../../components/layout/SidebarVistoriador';
import VistoriadorTabBar from '../../../components/dashboard/VistoriadorTabBar';
import type { VistoriadorTab } from '../../../components/dashboard/VistoriadorTabBar';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Settings, PenTool, MoreVertical, Save, Copy, Plus, Trash, Edit, Camera, FileText, ChevronRight, Sparkles, BookMarked, AlertCircle, Clock, CheckSquare, Calendar, MapPin, Play, Bell, Key, Eye, Building, Maximize2, DoorOpen, DoorClosed } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ModeloVistoria, vistorias as vistoriasMock } from '@/components/layout/SidebarVistoriador';
import type { Vistoria as VistoriaImported } from '@/components/layout/SidebarVistoriador';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import Image from 'next/image';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

// Importação dinâmica do componente de mapa para evitar erros de SSR
const Map = dynamic(
  () => import('../../../components/Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

// Função auxiliar para obter a cor baseada no status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pendente':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Em andamento':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Concluído':
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Função auxiliar para obter o ícone baseado no status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pendente':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case 'Em andamento':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'Concluído':
      return <CheckSquare className="w-4 h-4 text-green-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

// Interface para a pessoa que está assinando
interface Assinante {
  tipo: 'vistoriador' | 'proprietario' | 'inquilino';
  nome: string;
  email: string;
  telefone: string;
  assinatura?: string;
}

// Estender a interface importada para incluir os campos adicionais
interface VistoriaType extends VistoriaImported {
  ambientesTotal?: number;
  tempoExecucaoInicio?: number;
  tempoExecucaoTotal?: number;
  emExecucao?: boolean;
}

export default function DashVistoriador() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<VistoriadorTab>('dados');
  const [sidebarTab, setSidebarTab] = useState<'local' | 'enviadas'>('local');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVistoria, setActiveVistoria] = useState<string>('');
  const [activeModelo, setActiveModelo] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAmbienteDialog, setShowAmbienteDialog] = useState(false);
  const [selectedAmbiente, setSelectedAmbiente] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [signatureTitle, setSignatureTitle] = useState('');
  const [isSaveModelOpen, setIsSaveModelOpen] = useState(false);
  const [isApplyModelOpen, setIsApplyModelOpen] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [cronometroAtivo, setCronometroAtivo] = useState(false);
  const [tempoExecucao, setTempoExecucao] = useState(0);
  const [showEditVistoriaDialog, setShowEditVistoriaDialog] = useState(false);
  const [vistorias, setVistorias] = useState<VistoriaType[]>(vistoriasMock as VistoriaType[]);
  const [savedModels, setSavedModels] = useState<{ 
    id: string; 
    nome: string; 
    dataCriacao: string;
    dados?: {
      endereco?: string;
      data?: string;
      tipoImovel?: string;
      imobiliaria?: string;
      mobilia?: string;
      area?: string;
      ambientesTotal?: number;
    }
  }[]>([
    { 
      id: 'modelo-1', 
      nome: 'Apartamento 2 Quartos', 
      dataCriacao: '20/03/2024',
      dados: {
        endereco: 'Rua das Flores, 123 - Jardim Primavera',
        data: '01/04/2024',
        tipoImovel: 'Apartamento',
        imobiliaria: 'Imob Express',
        mobilia: 'semi_mobiliado',
        area: '65',
        ambientesTotal: 5
      }
    },
    { 
      id: 'modelo-2', 
      nome: 'Casa com Quintal', 
      dataCriacao: '22/03/2024',
      dados: {
        endereco: 'Av. das Palmeiras, 500 - Jardim Europa',
        data: '05/04/2024',
        tipoImovel: 'Casa',
        imobiliaria: 'Imob Premium',
        mobilia: 'mobiliado',
        area: '120',
        ambientesTotal: 8
      }
    }
  ]);

  // Estados para o modal de assinatura
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<Assinante | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Lista de pessoas envolvidas na vistoria
  const [pessoasEnvolvidas, setPessoasEnvolvidas] = useState<Assinante[]>([
    {
      tipo: 'vistoriador',
      nome: 'Carlos Pereira',
      email: 'carlos.pereira@email.com',
      telefone: '(11) 97777-7777'
    },
    {
      tipo: 'proprietario',
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999'
    },
    {
      tipo: 'inquilino',
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      telefone: '(11) 98888-8888'
    }
  ]);

  // Inicializa o canvas quando o componente é montado
  useEffect(() => {
    if (isSignatureModalOpen && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
      }
    }
  }, [isSignatureModalOpen]);

  // Limpa o canvas quando o modal é aberto
  useEffect(() => {
    if (isSignatureModalOpen) {
      clearCanvas();
    }
  }, [isSignatureModalOpen]);

  // Função para limpar o canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Função para iniciar o desenho
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Evento de toque
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setLastX(x);
    setLastY(y);
  };

  // Função para desenhar
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Evento de toque
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Previne o scroll da tela enquanto desenha
      e.preventDefault();
    } else {
      // Evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastX(x);
    setLastY(y);
  };

  // Função para parar o desenho
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    // Redirecionar para a página de navegação
    router.push('/dashboard/vistoriador/navegacao');
  };

  const handleSidebarTabChange = (tab: 'local' | 'enviadas') => {
    setSidebarTab(tab);
  };

  const handleStartInspection = () => {
    // Atualiza a vistoria para indicar que está em execução e inicia o cronômetro
    const vistoriasAtualizadas = vistorias.map(v => 
      v.id === activeVistoria ? { 
        ...v, 
        emExecucao: true, 
        tempoExecucaoInicio: Date.now(),
        tempoExecucaoTotal: v.tempoExecucaoTotal || 0
      } : v
    );
    
    // Atualiza o estado das vistorias no componente
    const vistoriaAtiva = vistoriasAtualizadas.find(v => v.id === activeVistoria);
    if (vistoriaAtiva) {
      setCronometroAtivo(true);
      
      // Verificar se é uma vistoria de saída
      if (vistoriaAtiva.tipoVistoria === 'saida') {
        // Para vistorias de saída, redirecionar para a página específica
        const params = new URLSearchParams();
        params.append('vistoriaId', vistoriaAtiva.id);
        router.push(`/dashboard/vistoriador/capavistoriasaida?${params.toString()}`);
      } else {
        // Para vistorias normais (entrada ou conferência), usar a página padrão
        router.push('/dashboard/vistoriador/vistoriar');
      }
    } else {
      // Caso não encontre a vistoria ativa, usar a página padrão
      router.push('/dashboard/vistoriador/vistoriar');
    }
  };

  // Obtém a vistoria ativa com base no ID selecionado
  const vistoriaAtiva = vistorias.find(v => v.id === activeVistoria);

  // Função para abrir o modal de assinatura
  const handleOpenSignatureModal = (assinante: Assinante) => {
    setCurrentSigner(assinante);
    setIsSignatureModalOpen(true);
    console.log("Modal aberto para:", assinante.nome); // Debug
  };

  // Função para salvar a assinatura
  const handleSaveSignature = (assinaturaBase64: string) => {
    if (!currentSigner) return;
    
    // Atualiza a assinatura da pessoa
    const pessoasAtualizadas = pessoasEnvolvidas.map(pessoa => 
      pessoa.tipo === currentSigner.tipo 
        ? { ...pessoa, assinatura: assinaturaBase64 } 
        : pessoa
    );
    
    setPessoasEnvolvidas(pessoasAtualizadas);
    setIsSignatureModalOpen(false);
    toast.success('Assinatura salva com sucesso!');
  };

  // Função para selecionar um modelo
  const handleModeloClick = (modeloId: string) => {
    setActiveModelo(modeloId);
    setActiveVistoria(''); // Limpa a vistoria selecionada
    console.log(`Modelo ${modeloId} selecionado`);
    
    // Fechamos a sidebar em dispositivos móveis após a seleção
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Mostramos a aba de dados
    setActiveTab('dados');
    
    // Exibe um toast de confirmação
    toast.success(`Modelo "${savedModels.find(m => m.id === modeloId)?.nome}" selecionado!`);
  };

  // Função para salvar um novo modelo
  const handleSaveModel = () => {
    if (modelName.trim()) {
      // Cria novo modelo com dados da vistoria atual
      const vistoriaAtiva = vistorias.find(v => v.id === activeVistoria);
      
      if (!vistoriaAtiva) {
        toast.error('Não há vistoria ativa para salvar como modelo.');
        return;
      }
      
      const novoModelo = {
        id: `modelo-${Date.now()}`,
        nome: modelName,
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
        dados: {
          endereco: vistoriaAtiva.endereco,
          data: vistoriaAtiva.data,
          tipoImovel: vistoriaAtiva.tipoImovel,
          imobiliaria: vistoriaAtiva.imobiliaria,
          mobilia: vistoriaAtiva.mobilia,
          area: vistoriaAtiva.area,
          ambientesTotal: vistoriaAtiva.ambientesTotal || 6 // Valor padrão
        }
      };
      
      setSavedModels([...savedModels, novoModelo]);
      
      // Limpar os campos
      setModelName('');
      setModelDescription('');
      setIsSaveModelOpen(false);
      
      // Mostrar mensagem de confirmação
      toast.success('Modelo salvo com sucesso!');
      
      // Seleciona o novo modelo automaticamente
      handleModeloClick(novoModelo.id);
    } else {
      toast.error('Por favor, informe um nome para o modelo.');
    }
  };

  // Obtém a vistoria ou modelo ativo para exibição
  const getDadosAtivos = () => {
    if (activeModelo) {
      const modeloAtivo = savedModels.find(m => m.id === activeModelo);
      
      if (modeloAtivo && modeloAtivo.dados) {
        // Se há uma vistoria ativa, preserva os documentos anexados dela
        const vistoriaAtual = activeVistoria ? vistorias.find(v => v.id === activeVistoria) : undefined;
        
        return {
          id: activeModelo,
          titulo: `Modelo: ${modeloAtivo.nome}`,
          endereco: modeloAtivo.dados.endereco || 'Não definido',
          data: modeloAtivo.dados.data || 'Não definida',
          status: 'Modelo',
          coordenadas: { lat: 0, lng: 0 },
          imobiliaria: modeloAtivo.dados.imobiliaria || 'Não definida',
          tipoImovel: modeloAtivo.dados.tipoImovel || 'Não definido',
          tipoVistoria: 'entrada',
          mobilia: modeloAtivo.dados.mobilia || 'vazio',
          area: modeloAtivo.dados.area || '0',
          totalFotos: 0,
          totalVideos: 0,
          sincronizado: false,
          documentosAnexados: vistoriaAtual?.documentosAnexados || [],
          informacoesAdicionais: '',
          ambientesTotal: modeloAtivo.dados.ambientesTotal || 0
        };
      }
    }
    
    // Se não for um modelo, retorna a vistoria ativa
    return vistorias.find(v => v.id === activeVistoria);
  };

  const dadosAtivos = getDadosAtivos();

  // Função para aplicar um modelo na vistoria atual
  const handleApplyModel = (modeloId: string) => {
    const modelo = savedModels.find(m => m.id === modeloId);
    if (!modelo || !modelo.dados || !activeVistoria) {
      toast.error('Não foi possível aplicar o modelo na vistoria.');
      return;
    }

    // Cria uma cópia das vistorias
    const novasVistorias = [...vistorias];
    
    // Encontra o índice da vistoria ativa
    const vistoriaIndex = novasVistorias.findIndex(v => v.id === activeVistoria);
    if (vistoriaIndex === -1) {
      toast.error('Vistoria não encontrada.');
      return;
    }

    // Atualiza a vistoria com os dados do modelo, preservando os documentos anexados
    novasVistorias[vistoriaIndex] = {
      ...novasVistorias[vistoriaIndex],
      endereco: modelo.dados.endereco || novasVistorias[vistoriaIndex].endereco,
      tipoImovel: modelo.dados.tipoImovel || novasVistorias[vistoriaIndex].tipoImovel,
      imobiliaria: modelo.dados.imobiliaria || novasVistorias[vistoriaIndex].imobiliaria,
      mobilia: (modelo.dados.mobilia as 'vazio' | 'semi_mobiliado' | 'mobiliado' | 'super_mobiliado') || novasVistorias[vistoriaIndex].mobilia,
      area: modelo.dados.area || novasVistorias[vistoriaIndex].area,
      ambientesTotal: modelo.dados.ambientesTotal || novasVistorias[vistoriaIndex].ambientesTotal,
      // Preserva os documentos anexados existentes
      documentosAnexados: novasVistorias[vistoriaIndex].documentosAnexados
    };

    // Simula a atualização das vistorias (em um cenário real, isso seria persistido)
    // vistorias = novasVistorias; // Não podemos modificar diretamente devido ao const

    // Fecha o modal
    setIsApplyModelOpen(false);

    // Mostra mensagem de sucesso
    toast.success(`Modelo "${modelo.nome}" aplicado com sucesso!`);
  };

  // Título para mostrar qual modelo ou vistoria está selecionado
  const getPageTitle = () => {
    if (activeModelo) {
      const modelo = savedModels.find(m => m.id === activeModelo);
      return `Modelo: ${modelo?.nome || 'Não encontrado'}`;
    } else if (activeVistoria) {
      const vistoria = vistorias.find(v => v.id === activeVistoria);
      if (vistoria) {
        return (
          <div className="flex items-center gap-2">
            <span>
              {vistoria.sequentialCode || ''}
            </span>
            {vistoria.tipoVistoria === 'saida' && vistoria.entryInspectionCode && (
              <span className="text-xs font-normal text-gray-500 self-center">
                (cód. vistoria de entrada: {vistoria.entryInspectionCode})
              </span>
            )}
          </div>
        );
      }
      return 'Vistoria não encontrada';
    }
    return 'Painel do Vistoriador';
  };

  // Função para lidar com a edição de uma vistoria sincronizada
  const handleEditVistoria = () => {
    // Abre o modal de confirmação
    setShowEditVistoriaDialog(true);
  };

  // Função para confirmar a edição da vistoria
  const handleConfirmEditVistoria = () => {
    // Verifica se existe uma vistoria ativa
    if (!vistoriaAtiva) return;

    // Atualiza a vistoria para não sincronizada e volta para a seção de vistorias locais
    const vistoriasAtualizadas = vistorias.map(v => 
      v.id === activeVistoria ? { 
        ...v, 
        sincronizado: false,
        // Reinicia o tempo de execução para continuar a contagem
        emExecucao: true,
        tempoExecucaoInicio: Date.now(),
        // Mantém o tempo total acumulado anteriormente
        tempoExecucaoTotal: v.tempoExecucaoTotal || 0
      } : v
    );

    // Atualiza o estado das vistorias
    // Em um caso real, isso seria persistido no banco de dados
    // Como estamos trabalhando com dados mock, atualizamos diretamente o array
    for (let i = 0; i < vistorias.length; i++) {
      if (vistorias[i].id === activeVistoria) {
        vistorias[i].sincronizado = false;
        vistorias[i].emExecucao = true;
        vistorias[i].tempoExecucaoInicio = Date.now();
      }
    }
    
    // Primeiro atualiza o estado da aba para 'local'
    setSidebarTab('local');
    
    // Exibe mensagem de confirmação
    toast.success('A vistoria foi movida para a lista de vistorias locais para edição.');
    
    // Fecha o modal de confirmação
    setShowEditVistoriaDialog(false);
  };

  // Altera o texto do botão de acordo com a vistoria selecionada
  const getButtonText = () => {
    // Se não há vistoria ativa, retorna texto padrão
    if (!vistoriaAtiva) return "Iniciar Vistoria";
    
    // Se a vistoria está na aba de enviadas (sincronizadas), o texto é "Visualizar vistoria"
    // Caso contrário (local), é "Iniciar vistoria"
    return sidebarTab === 'enviadas' ? "Visualizar Vistoria" : "Iniciar Vistoria";
  };

  // Retorna o ícone apropriado para o botão baseado no texto
  const getButtonIcon = () => {
    if (!vistoriaAtiva) return <Play className="w-5 h-5" />;
    return sidebarTab === 'enviadas' ? <Eye className="w-5 h-5" /> : <Play className="w-5 h-5" />;
  };

  // Renderiza o conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'dados':
        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-8">
            {/* Cabeçalho com Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${activeModelo ? 'bg-amber-100' : 'bg-primary/10'} flex items-center justify-center`}>
                  {activeModelo ? 
                    <BookMarked className="w-6 h-6 text-amber-600" /> : 
                    <FileText className="w-6 h-6 text-primary" />
                  }
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeModelo ? 'Dados do Modelo' : 'Dados da Vistoria'}
                </h2>
              </div>
              <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
                activeModelo 
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : sidebarTab === 'enviadas' && dadosAtivos?.sincronizado
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : getStatusColor(dadosAtivos?.status || 'Pendente')
              }`}>
                {activeModelo ? (
                  <BookMarked className="w-4 h-4 text-amber-600" />
                ) : sidebarTab === 'enviadas' && dadosAtivos?.sincronizado ? (
                  <button 
                    onClick={handleEditVistoria}
                    className="font-medium flex items-center gap-2 text-green-700"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Vistoria
                  </button>
                ) : (
                  <>
                    {getStatusIcon(dadosAtivos?.status || 'Pendente')}
                    <span className="font-medium">{dadosAtivos?.status || 'Pendente'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Dados da Vistoria */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Data</span>
                      <p className="font-medium text-gray-900">{dadosAtivos?.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Horário</span>
                      <p className="font-medium text-gray-900">14:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Endereço</span>
                      <p className="font-medium text-gray-900">{dadosAtivos?.endereco}</p>
                    </div>
                  </div>
                </div>
                
                {/* Documentos Anexados */}
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500 block mb-2">Documentos Anexados</span>
                  <div className="space-y-2">
                    {dadosAtivos && dadosAtivos.documentosAnexados && dadosAtivos.documentosAnexados.length > 0 ? (
                      dadosAtivos.documentosAnexados.map((doc: { nome: string; url: string }, index: number) => (
                        <a
                          key={index}
                          href={doc.url}
                          download
                          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-rose-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                              {doc.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              Clique para baixar
                            </p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      ))
                    ) : (
                      <>
                        <a
                          href="#"
                          download
                          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-rose-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                              Contrato.pdf
                            </p>
                            <p className="text-xs text-gray-500">
                              Clique para baixar
                            </p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                        <a
                          href="#"
                          download
                          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-rose-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                              Documentação.pdf
                            </p>
                            <p className="text-xs text-gray-500">
                              Clique para baixar
                            </p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card de Progresso */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Progresso da Vistoria</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ambientes Vistoriados</span>
                    <span className="font-semibold text-primary text-lg">
                      {activeModelo ? `0/${dadosAtivos?.ambientesTotal || 0}` : '0/6'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-violet-500 to-violet-400 rounded-full h-3" style={{ width: '0%' }}></div>
                  </div>
                  
                  {/* Tempo de execução */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-600">Tempo de execução</span>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      <span className="font-semibold text-primary text-lg">
                        {cronometroAtivo ? formatarTempoExecucao(tempoExecucao) : "00:00"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <span className="text-2xl font-bold text-violet-600">0</span>
                      <p className="text-sm text-gray-500 mt-1">Concluídos</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <span className="text-2xl font-bold text-amber-500">0</span>
                      <p className="text-sm text-gray-500 mt-1">Em Progresso</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <span className="text-2xl font-bold text-slate-400">
                        {activeModelo ? dadosAtivos?.ambientesTotal || 0 : 6}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">Pendentes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Imóvel */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informações do Imóvel</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Home className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Tipo de Imóvel</span>
                      <p className="font-medium text-gray-900">{dadosAtivos?.tipoImovel || "Apartamento"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Imobiliária</span>
                      <p className="font-medium text-gray-900">{dadosAtivos?.imobiliaria || "Imob Express"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">Estado da Mobília</span>
                      {/* Substituindo o texto por um dropdown editável */}
                      <div className="relative">
                        <select 
                          value={dadosAtivos?.mobilia || 'vazio'}
                          onChange={(e) => {
                            atualizarMobilia(e.target.value as 'vazio' | 'semi_mobiliado' | 'mobiliado' | 'super_mobiliado');
                          }}
                          className="w-full font-medium text-gray-900 border-0 border-b border-transparent hover:border-gray-300 focus:border-primary focus:ring-0 bg-transparent py-1 px-0"
                        >
                          <option value="vazio">Vazio</option>
                          <option value="semi_mobiliado">Semi-mobiliado</option>
                          <option value="mobiliado">Mobiliado</option>
                          <option value="super_mobiliado">Super Mobiliado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">Área</span>
                      {/* Campo de input para editar a área */}
                      <div className="relative">
                        <input
                          type="text"
                          value={dadosAtivos?.area || ''}
                          onChange={(e) => {
                            // Remover caracteres não numéricos, exceto ponto e vírgula
                            let valor = e.target.value.replace(/[^\d.,]/g, '');
                            
                            // Garantir que há apenas um separador decimal
                            const qtdSeparadores = (valor.match(/[.,]/g) || []).length;
                            if (qtdSeparadores > 1) {
                              const ultimoSeparador = Math.max(valor.lastIndexOf('.'), valor.lastIndexOf(','));
                              valor = valor.substring(0, ultimoSeparador) + valor.substring(ultimoSeparador).replace(/[.,]/g, '');
                            }
                            
                            atualizarArea(valor);
                          }}
                          onBlur={(e) => formatarArea(e.target.value)}
                          className="w-full font-medium text-gray-900 border-0 border-b border-transparent hover:border-gray-300 focus:border-primary focus:ring-0 bg-transparent py-1 px-0"
                          placeholder="0.00 m²"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Imobiliária</span>
                      <p className="font-medium text-gray-900">{dadosAtivos?.imobiliaria || 'Não informada'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mídia e Informações Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Seção de Mídia - Apenas exibida para vistorias, não para modelos */}
              {!activeModelo && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Mídia</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Fotos</span>
                          <p className="font-semibold text-gray-900">{dadosAtivos?.totalFotos || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-600"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Vídeos</span>
                          <p className="font-semibold text-gray-900">{dadosAtivos?.totalVideos || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dadosAtivos?.informacoesAdicionais && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-900">
                    {dadosAtivos.informacoesAdicionais}
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Ação */}
            <div className="flex justify-end pt-4">
              <button 
                  onClick={handleStartInspection}
                  className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                  {getButtonIcon()}
                  {getButtonText()}
              </button>
            </div>
          </div>
        );
      
      case 'ambientes':
        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ambientes a serem vistoriados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Sala', 'Cozinha', 'Quarto 1', 'Quarto 2', 'Banheiro', 'Área de Serviço'].map((ambiente) => (
                <button
                  key={ambiente}
                  onClick={() => setSelectedAmbiente(ambiente)}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                    <span className="font-medium text-gray-900">{ambiente}</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedAmbiente && (
              <Dialog.Root open={!!selectedAmbiente} onOpenChange={() => setSelectedAmbiente('')}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[1101] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <Dialog.Title className="text-xl font-semibold text-gray-900">
                        Vistoria do Ambiente: {selectedAmbiente}
                      </Dialog.Title>
                      <Dialog.Close className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </Dialog.Close>
                    </div>

                    <div className="space-y-6">
                      {/* Status do Ambiente */}
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Pendente de Vistoria</span>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Itens para Verificação:</h3>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-sm text-gray-600">Paredes</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-sm text-gray-600">Piso</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-sm text-gray-600">Teto</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-sm text-gray-600">Iluminação</span>
                          </label>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
                          <Camera className="w-4 h-4" />
                          <span>Adicionar Fotos</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">
                          <CheckSquare className="w-4 h-4" />
                          <span>Marcar como Vistoriado</span>
                        </button>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            )}
          </div>
        );

      case 'envolvidos':
        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pessoas Envolvidas
            </h2>
            <div className="space-y-4">
              {/* Vistoriador */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Vistoriador</h3>
                  <button
                    onClick={() => handleOpenSignatureModal(pessoasEnvolvidas.find(p => p.tipo === 'vistoriador')!)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Assinar</span>
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'vistoriador')?.nome}</p>
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'vistoriador')?.email}</p>
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'vistoriador')?.telefone}</p>
                  {pessoasEnvolvidas.find(p => p.tipo === 'vistoriador')?.assinatura && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Assinatura:</p>
                      <img 
                        src={pessoasEnvolvidas.find(p => p.tipo === 'vistoriador')?.assinatura} 
                        alt="Assinatura do vistoriador" 
                        className="max-h-16 border border-gray-200 rounded p-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Proprietário */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Proprietário</h3>
                  <button
                    onClick={() => handleOpenSignatureModal(pessoasEnvolvidas.find(p => p.tipo === 'proprietario')!)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Assinar</span>
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'proprietario')?.nome}</p>
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'proprietario')?.email}</p>
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'proprietario')?.telefone}</p>
                  {pessoasEnvolvidas.find(p => p.tipo === 'proprietario')?.assinatura && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Assinatura:</p>
                      <img 
                        src={pessoasEnvolvidas.find(p => p.tipo === 'proprietario')?.assinatura} 
                        alt="Assinatura do proprietário" 
                        className="max-h-16 border border-gray-200 rounded p-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Inquilino */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Inquilino</h3>
                  <button
                    onClick={() => handleOpenSignatureModal(pessoasEnvolvidas.find(p => p.tipo === 'inquilino')!)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Assinar</span>
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'inquilino')?.nome}</p>
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'inquilino')?.email}</p>
                  <p>{pessoasEnvolvidas.find(p => p.tipo === 'inquilino')?.telefone}</p>
                  {pessoasEnvolvidas.find(p => p.tipo === 'inquilino')?.assinatura && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Assinatura:</p>
                      <img 
                        src={pessoasEnvolvidas.find(p => p.tipo === 'inquilino')?.assinatura} 
                        alt="Assinatura do inquilino" 
                        className="max-h-16 border border-gray-200 rounded p-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'localizacao':
        // Definindo coordenadas padrão caso não haja vistoria ativa
        const defaultCoords = { lat: -23.5505, lng: -46.6333 };
        const coords = dadosAtivos?.coordenadas || defaultCoords;
        const endereco = dadosAtivos?.endereco || 'Endereço não disponível';

        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Localização do Imóvel
            </h2>
            
            {/* Informações do Endereço */}
            <div className="bg-gray-50 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Endereço Completo</h3>
                  <p className="text-gray-600 mt-1">{endereco}</p>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="h-[400px] rounded-lg overflow-hidden">
              <Map
                key={`map-${dadosAtivos?.id}`}
                center={coords}
                zoom={15}
                markers={[
                  {
                    position: coords,
                    title: endereco
                  }
                ]}
              />
            </div>
          </div>
        );
    }
  };

  // Efeito para atualizar o cronômetro a cada segundo
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Verifica se há alguma vistoria em execução
    const vistoriaEmExecucao = vistorias.find(v => v.emExecucao);
    
    if (vistoriaEmExecucao && vistoriaEmExecucao.tempoExecucaoInicio) {
      // Inicia o cronômetro
      setCronometroAtivo(true);
      
      // Calcula o tempo inicial com base no timestamp armazenado e qualquer tempo acumulado anterior
      const tempoInicial = vistoriaEmExecucao.tempoExecucaoTotal || 0;
      
      intervalId = setInterval(() => {
        const tempoDecorrido = Date.now() - (vistoriaEmExecucao.tempoExecucaoInicio || 0);
        setTempoExecucao(tempoInicial + tempoDecorrido);
      }, 1000);
    } else {
      setCronometroAtivo(false);
      setTempoExecucao(0);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [vistorias]);
  
  // Função para formatar o tempo em horas e minutos
  const formatarTempoExecucao = (tempo: number) => {
    const segundosTotais = Math.floor(tempo / 1000);
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Carregar vistorias do localStorage ao iniciar
    const vistoriasStorage = localStorage.getItem('vistorias');
    if (vistoriasStorage) {
      try {
        setVistorias(JSON.parse(vistoriasStorage));
      } catch (error) {
        console.error('Erro ao carregar vistorias do localStorage:', error);
        setVistorias(vistoriasMock);
      }
    } else {
      // Usar os dados mockados se não houver dados no localStorage
      setVistorias(vistoriasMock);
      localStorage.setItem('vistorias', JSON.stringify(vistoriasMock));
    }
  }, []);

  // Na função que atualiza a mobília
  const atualizarMobilia = (novoEstado: 'vazio' | 'semi_mobiliado' | 'mobiliado' | 'super_mobiliado') => {
    if (activeVistoria) {
      const vistoriasAtualizadas = vistorias.map((v: VistoriaType) => 
        v.id === activeVistoria ? { ...v, mobilia: novoEstado } : v
      );
      setVistorias(vistoriasAtualizadas);
      localStorage.setItem('vistorias', JSON.stringify(vistoriasAtualizadas));
    }
  };
  
  // Na função que atualiza a área
  const atualizarArea = (valor: string) => {
    if (activeVistoria) {
      const vistoriasAtualizadas = vistorias.map((v: VistoriaType) => 
        v.id === activeVistoria ? { ...v, area: valor } : v
      );
      setVistorias(vistoriasAtualizadas);
      localStorage.setItem('vistorias', JSON.stringify(vistoriasAtualizadas));
    }
  };
  
  // Na função que formata a área ao perder o foco
  const formatarArea = (valor: string) => {
    if (valor.trim() && activeVistoria) {
      let valorNumerico = valor.replace(',', '.');
      if (!isNaN(parseFloat(valorNumerico))) {
        valorNumerico = parseFloat(valorNumerico).toFixed(2);
        const vistoriasAtualizadas = vistorias.map((v: VistoriaType) => 
          v.id === activeVistoria ? { ...v, area: `${valorNumerico} m²` } : v
        );
        setVistorias(vistoriasAtualizadas);
        localStorage.setItem('vistorias', JSON.stringify(vistoriasAtualizadas));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarVistoriador
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeVistoriaId={activeVistoria}
        activeModeloId={activeModelo || undefined}
        onVistoriaClick={(id) => {
          setActiveVistoria(id);
          setActiveModelo('');
          setShowSettings(false);
        }}
        onModeloClick={handleModeloClick}
        onSettingsClick={handleShowSettings}
        showSettings={showSettings}
        activeTab={sidebarTab}
        onTabChange={handleSidebarTabChange}
        modelos={savedModels}
      />
      <ClientHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      
      <main className="md:pl-64 pt-16">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          {!showSettings && (
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-xl font-bold text-gray-800">
                  {getPageTitle()}
                </h1>
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-white border border-border rounded-xl p-1.5 flex flex-wrap gap-2">
                  {['dados', 'ambientes', 'envolvidos', 'localizacao'].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as VistoriadorTab)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActive 
                            ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className="capitalize">{tab}</span>
                      </button>
                    );
                  })}
                </div>
                {dadosAtivos && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="p-2 text-gray-600 hover:text-primary border border-gray-200 hover:border-primary hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                        title="Opções"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="min-w-[220px] bg-white rounded-lg shadow-lg p-2 space-y-1"
                        sideOffset={5}
                      >
                        <DropdownMenu.Item asChild>
                          <button
                            onClick={() => setIsSaveModelOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md w-full"
                          >
                            <Save className="w-4 h-4" />
                            Salvar vistoria como modelo
                          </button>
                        </DropdownMenu.Item>
                        
                        {/* Item "Aplicar modelo na vistoria" - só exibido quando a vistoria não está finalizada */}
                        {sidebarTab !== 'enviadas' && (
                          <DropdownMenu.Item asChild>
                            <button
                              onClick={() => setIsApplyModelOpen(true)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md w-full"
                            >
                              <BookMarked className="w-4 h-4" />
                              Aplicar modelo na vistoria
                            </button>
                          </DropdownMenu.Item>
                        )}
                          
                        <DropdownMenu.Item asChild>
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md w-full"
                          >
                            <FileText className="w-4 h-4" />
                            Gerar laudo rascunho
                          </button>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>
            </div>
          )}
          {renderContent()}
          
          {/* Modal Salvar Vistoria como Modelo */}
          <Dialog.Root open={isSaveModelOpen} onOpenChange={setIsSaveModelOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Salvar vistoria como modelo
                  </Dialog.Title>
                  <Dialog.Close className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="model-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do modelo
                    </label>
                    <input
                      id="model-name"
                      type="text"
                      placeholder="Ex: Apartamento padrão 2 quartos"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="model-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição (opcional)
                    </label>
                    <textarea
                      id="model-description"
                      placeholder="Descreva brevemente este modelo..."
                      value={modelDescription}
                      onChange={(e) => setModelDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2 gap-3">
                    <Dialog.Close className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                      Cancelar
                    </Dialog.Close>
                    <button
                      onClick={handleSaveModel}
                      disabled={!modelName.trim()}
                      className={`px-4 py-2 rounded-lg ${
                        modelName.trim() 
                          ? 'bg-primary hover:bg-primary-light text-white' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      } transition-colors`}
                    >
                      Salvar modelo
                    </button>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          
          {/* Modal Aplicar Modelo na Vistoria */}
          <Dialog.Root open={isApplyModelOpen} onOpenChange={setIsApplyModelOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Aplicar modelo na vistoria
                  </Dialog.Title>
                  <Dialog.Close className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>
                
                <div className="space-y-4">
                  {savedModels.length > 0 ? (
                    <div className="space-y-3">
                      {savedModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            // Lógica para aplicar o modelo
                            handleApplyModel(model.id);
                          }}
                          className="w-full p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookMarked className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-medium text-gray-900">{model.nome}</h3>
                              <p className="text-sm text-gray-500">Criado em {model.dataCriacao}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <BookMarked className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum modelo disponível</h3>
                      <p className="text-gray-500">Salve uma vistoria como modelo primeiro.</p>
                    </div>
                  )}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Modal de Assinatura - Agora renderizado diretamente no body */}
          {isSignatureModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-[1700] flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg z-[1701] p-6 w-[95%] max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assinatura de {currentSigner?.nome}
                  </h2>
                  <button 
                    onClick={() => setIsSignatureModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Desenhe sua assinatura no espaço abaixo:
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={350}
                      height={200}
                      className="w-full touch-none bg-white rounded-lg shadow-inner"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseOut={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={clearCanvas}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Limpar
                    </button>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsSignatureModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const assinaturaBase64 = canvas.toDataURL('image/png');
                          handleSaveSignature(assinaturaBase64);
                        }}
                        disabled={!hasSignature}
                        className={`px-4 py-2 rounded-lg ${
                          hasSignature 
                            ? 'bg-primary hover:bg-primary-light text-white' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        } transition-colors`}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmação de edição */}
          <Dialog.Root open={showEditVistoriaDialog} onOpenChange={setShowEditVistoriaDialog}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-xl z-50 w-full max-w-md">
                <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                  Confirmar edição da vistoria
                </Dialog.Title>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">
                    Ao editar esta vistoria, ela será removida do painel do gestor/imobiliária e voltará para sua lista de vistorias locais.
                  </p>
                  <p className="text-gray-600 font-medium">
                    Após as alterações, será necessário sincronizar novamente para que as mudanças sejam visíveis para o gestor.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEditVistoriaDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmEditVistoria}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </main>
    </div>
  );
}


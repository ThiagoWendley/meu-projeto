'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Plus, Image as ImageIcon, Zap, Key, X, Pencil, Trash2, MoreVertical, MapPin, Calendar, DoorOpen, DoorClosed, ClipboardCheck, Droplets, Flame, AlertCircle, Upload, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Vistoria } from '@/components/layout/SidebarVistoriador';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// Estendendo a interface Vistoria para incluir propriedades de tempo de execução
interface VistoriaEstendida extends Vistoria {
  tempoExecucaoInicio?: number | null;
  tempoExecucaoTotal?: number;
  emExecucao?: boolean;
  codigo?: string;
}

interface Foto {
  id: string;
  url: string;
  tipo: 'chave' | 'medidor' | 'outros' | 'ambientes';
  medidorId?: string;
  descricao?: string;
  referenciaEntradaId?: string;
}

interface Medidor {
  id: string;
  tipo: 'agua' | 'energia' | 'gas';
  identificacao: string;
  numeroLeitura: string;
  unidadeMedida: string;
  foto?: string;
}

// Mock data para vistorias
const vistoriasMock: VistoriaEstendida[] = [
  {
    id: '1',
    titulo: 'Vistoria - Apartamento 123',
    codigo: '570',
    endereco: 'Av. Paulista, 1000 - Apto 123',
    data: '25/03/2024',
    status: 'Pendente',
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    imobiliaria: 'Imobiliária Premium',
    tipoImovel: 'Apartamento',
    mobilia: 'vazio',
    area: '100.0 m²',
    totalFotos: 45,
    totalVideos: 2,
    informacoesAdicionais: 'Chaves disponíveis na portaria.',
    sincronizado: false,
    tipoVistoria: 'entrada',
    documentosAnexados: [
      {
        nome: 'Documento 1',
        url: 'https://example.com/documento1.pdf'
      }
    ],
    tempoExecucaoInicio: null,
    tempoExecucaoTotal: 0,
    emExecucao: false
  },
  {
    id: '2',
    titulo: 'Vistoria - Casa 456',
    codigo: '571',
    endereco: 'Rua Augusta, 500',
    data: '26/03/2024',
    status: 'Em andamento',
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    imobiliaria: 'Imobiliária Alpha',
    tipoImovel: 'Casa',
    mobilia: 'mobiliado',
    area: '75.5 m²',
    totalFotos: 32,
    totalVideos: 1,
    informacoesAdicionais: 'Agendar com proprietário',
    sincronizado: true,
    tipoVistoria: 'saida',
    entryInspectionCode: '533',
    documentosAnexados: [
      {
        nome: 'Documento 2',
        url: 'https://example.com/documento2.pdf'
      }
    ]
  },
  {
    id: '3',
    titulo: 'Vistoria - Apartamento 789',
    codigo: '572',
    endereco: 'Rua Oscar Freire, 800 - Apto 301',
    data: '28/03/2024',
    status: 'Pendente',
    coordenadas: { lat: -23.5616, lng: -46.6721 },
    imobiliaria: 'Imobiliária Premium',
    tipoImovel: 'Apartamento',
    mobilia: 'semi_mobiliado',
    area: '85.0 m²',
    totalFotos: 0,
    totalVideos: 0,
    informacoesAdicionais: 'Vistoria de saída para o imóvel. Contato do inquilino: (11) 97777-7777',
    sincronizado: false,
    tipoVistoria: 'saida',
    entryInspectionCode: '456',
    documentosAnexados: [
      {
        nome: 'Contrato.pdf',
        url: 'https://example.com/contrato.pdf'
      }
    ],
    tempoExecucaoInicio: null,
    tempoExecucaoTotal: 0,
    emExecucao: false
  }
];

// Dados simulados da vistoria de entrada correspondente
const vistoriaEntradaMock: {
  fotos: Foto[];
  parecer: string;
  medidores: Medidor[];
} = {
  fotos: [
    {
      id: 'entrada-1',
      url: '/mock-images/chave.jpg',
      tipo: 'chave',
      descricao: 'Chave principal em bom estado'
    },
    {
      id: 'entrada-2',
      url: '/mock-images/medidor.jpg',
      tipo: 'medidor',
      descricao: 'Medidor de energia - leitura inicial',
      medidorId: 'medidor-1'
    },
    {
      id: 'entrada-3',
      url: '/mock-images/fachada.jpg',
      tipo: 'outros',
      descricao: 'Estado geral da fachada'
    },
    {
      id: 'entrada-4',
      url: '/mock-images/sala.jpg',
      tipo: 'ambientes',
      descricao: 'Sala de estar em boas condições'
    }
  ],
  parecer: 'Imóvel em excelentes condições gerais. Todos os equipamentos e instalações foram verificados e estão funcionando adequadamente. Paredes e pisos sem marcas ou danos aparentes. Móveis em bom estado de conservação.',
  medidores: [
    {
      id: 'medidor-1',
      tipo: 'energia',
      identificacao: 'Medidor Principal',
      numeroLeitura: '45678',
      unidadeMedida: 'kWh',
      foto: '/mock-images/medidor.jpg'
    },
    {
      id: 'medidor-2',
      tipo: 'agua',
      identificacao: 'Hidrômetro 01',
      numeroLeitura: '12345',
      unidadeMedida: 'm³'
    }
  ]
};

interface NovoMedidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medidor: Omit<Medidor, 'id'>) => void;
  initialData?: Omit<Medidor, 'id'>;
  title: string;
}

function NovoMedidorModal({ isOpen, onClose, onAdd, initialData, title }: NovoMedidorModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState<'agua' | 'energia' | 'gas'>(initialData?.tipo || 'agua');
  const [identificacao, setIdentificacao] = useState(initialData?.identificacao || '');
  const [numeroLeitura, setNumeroLeitura] = useState(initialData?.numeroLeitura || '');
  const [unidadeMedida, setUnidadeMedida] = useState(initialData?.unidadeMedida || '');
  const [foto, setFoto] = useState<string | undefined>(initialData?.foto);

  const handleSubmit = () => {
    if (tipo && identificacao && numeroLeitura && unidadeMedida) {
      onAdd({
        tipo,
        identificacao,
        numeroLeitura,
        unidadeMedida,
        foto
      });
      setTipo('agua');
      setIdentificacao('');
      setNumeroLeitura('');
      setUnidadeMedida('');
      setFoto(undefined);
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const unidadesPorTipo = {
    agua: ['m³'],
    energia: ['kWh'],
    gas: ['m³']
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Medidor
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'agua' | 'energia' | 'gas')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="agua">Água</option>
                <option value="energia">Energia</option>
                <option value="gas">Gás</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificação
              </label>
              <input
                type="text"
                value={identificacao}
                onChange={(e) => setIdentificacao(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ex: Medidor 01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número da Leitura
              </label>
              <input
                type="text"
                value={numeroLeitura}
                onChange={(e) => setNumeroLeitura(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ex: 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Medida
              </label>
              <select
                value={unidadeMedida}
                onChange={(e) => setUnidadeMedida(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione uma unidade</option>
                {unidadesPorTipo[tipo].map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto do Medidor
              </label>
              <div className="flex items-center gap-4">
                {foto ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={foto}
                      alt="Foto do medidor"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setFoto(undefined)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary/30 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
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
              {initialData ? 'Salvar' : 'Adicionar Medidor'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

function ImageDialog({ isOpen, onClose, imageUrl }: ImageDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[1100]" />
        <Dialog.Content className="fixed inset-0 z-[1101] flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative w-full max-w-4xl h-full max-h-[80vh] mx-4">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
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
          clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
          WebkitClipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)'
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

export default function VistoriarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [parecer, setParecer] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<'chave' | 'medidor' | 'outros' | 'ambientes'>('outros');
  const [sidebarTab, setSidebarTab] = useState<'local' | 'finalizadas'>('local');
  const [vistoriaAtiva, setVistoriaAtiva] = useState<VistoriaEstendida | null>(vistoriasMock[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [medidorSelecionado, setMedidorSelecionado] = useState<Medidor | null>(null);
  const [showNovoMedidor, setShowNovoMedidor] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [ambientesComAlerta, setAmbientesComAlerta] = useState(false);
  const [fotoReferenciaId, setFotoReferenciaId] = useState<string | null>(null);

  const categorias = [
    { id: 'chave', nome: 'Chaves', icon: <Key className="w-5 h-5 text-amber-500" />, bgColor: 'bg-amber-50' },
    { id: 'medidor', nome: 'Medidores', icon: <Zap className="w-5 h-5 text-purple-500" />, bgColor: 'bg-purple-50' },
    { id: 'outros', nome: 'Outros', icon: <ImageIcon className="w-5 h-5 text-blue-500" />, bgColor: 'bg-blue-50' },
    { id: 'ambientes', nome: 'Ambientes', icon: <DoorOpen className="w-5 h-5 text-green-500" />, bgColor: 'bg-green-50' },
  ];

  // Obtém as fotos
  const getFotosPorTab = () => {
    return fotos.filter(foto => foto.tipo === categoriaSelecionada);
  };

  // Obtém o parecer
  const getParecerPorTab = () => {
    return parecer;
  };

  // Obtém os medidores com base na aba selecionada
  const getMedidoresPorTab = () => {
    return medidores;
  };

  const handleVoltar = () => {
    router.push('/dashboard/vistoriador');
  };

  const handleCategoriaClick = (categoriaId: string) => {
    if (categoriaId === 'ambientes') {
      const params = new URLSearchParams();
      if (vistoriaAtiva) {
        params.append('vistoriaId', vistoriaAtiva.id);
        // Para vistorias normais (entrada), usar a página padrão
        params.append('tipoVistoria', vistoriaAtiva.tipoVistoria);
        router.push(`/dashboard/vistoriador/vistoriar/ambiente?${params.toString()}`);
      }
    } else {
      setCategoriaSelecionada(categoriaId as any);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const novaFoto: Foto = {
        id: Math.random().toString(),
        url: URL.createObjectURL(file),
        tipo: categoriaSelecionada,
        medidorId: medidorSelecionado?.id,
        descricao: '',
        referenciaEntradaId: fotoReferenciaId || undefined
      };
      setFotos([...fotos, novaFoto]);
      
      // Limpa a referência após o uso
      if (fotoReferenciaId) {
        setFotoReferenciaId(null);
      }
    }
  };

  const handleAddFoto = () => {
    fileInputRef.current?.click();
  };

  const fotosFiltradas = fotos.filter(foto => foto.tipo === categoriaSelecionada);

  const handleAddMedidor = (novoMedidor: Omit<Medidor, 'id'>) => {
    const medidor: Medidor = {
      id: Math.random().toString(),
      ...novoMedidor,
      foto: undefined
    };
    setMedidores([...medidores, medidor]);
  };

  const getTipoVistoriaIcon = (tipo: 'entrada' | 'saida' | 'conferencia') => {
    switch (tipo) {
      case 'entrada':
        return <DoorOpen className="w-5 h-5 text-emerald-600" />;
      case 'saida':
        return <DoorClosed className="w-5 h-5 text-orange-600" />;
      case 'conferencia':
        return <ClipboardCheck className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTipoVistoriaText = (tipo: 'entrada' | 'saida' | 'conferencia') => {
    switch (tipo) {
      case 'entrada':
        return 'Vistoria de Entrada';
      case 'saida':
        return 'Vistoria de Saída';
      case 'conferencia':
        return 'Vistoria de Conferência';
    }
  };

  const handleSincronizarVistoria = async () => {
    if (!vistoriaAtiva) return;
    
    setSincronizando(true);
    
    try {
      // Simular o processo de sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calcular o tempo total de execução
      let tempoTotal = 0;
      const vistoriaEstendida = vistoriaAtiva as VistoriaEstendida;
      if (vistoriaEstendida.tempoExecucaoInicio) {
        const tempoAcumulado = vistoriaEstendida.tempoExecucaoTotal || 0;
        const tempoDecorrido = Date.now() - vistoriaEstendida.tempoExecucaoInicio;
        tempoTotal = tempoAcumulado + tempoDecorrido;
      }
      
      // Atualizar a vistoria como sincronizada e parar o cronômetro
      const vistoriasAtualizadas = vistoriasMock.map(v => 
        v.id === vistoriaAtiva.id ? { 
          ...v, 
          sincronizado: true, 
          emExecucao: false,
          tempoExecucaoTotal: tempoTotal
        } : v
      );
      
      // Atualizar o estado local
      setVistoriaAtiva(null);
      setSidebarTab('finalizadas');
      
      // Feedback de sucesso
      alert('Vistoria sincronizada com sucesso!');
    } catch (error) {
      alert('Erro ao sincronizar vistoria. Tente novamente.');
    } finally {
      setSincronizando(false);
    }
  };

  // Verificar se há ambientes sem fotos (simulado)
  useEffect(() => {
    // Aqui você implementaria a lógica real para verificar ambientes/itens sem fotos
    const verificarAmbientesSemFotos = async () => {
      // Simulando uma verificação
      const temAlerta = Math.random() > 0.5;
      setAmbientesComAlerta(temAlerta);
    };

    verificarAmbientesSemFotos();
  }, []);

  // Função para verificar se já existe uma foto correspondente na vistoria de saída
  const existeImagemCorrespondente = (fotoEntradaId: string) => {
    // Verifica se existe alguma foto na vistoria de saída que tenha referência para esta foto de entrada
    return fotos.some(foto => foto.referenciaEntradaId === fotoEntradaId);
  };

  // Função para lidar com o clique em uma imagem de referência
  const handleAddFotoComReferencia = (fotoEntradaId: string) => {
    // Define o ID da foto de entrada como referência antes de adicionar a nova foto
    const fotoEntrada = vistoriaEntradaMock.fotos.find(f => f.id === fotoEntradaId);
    
    // Abre o seletor de arquivos
    fileInputRef.current?.click();
    
    // Seria necessário salvar essa relação entre a foto nova e a antiga
    setFotoReferenciaId(fotoEntradaId);
  };

  // Função para deletar uma foto de saída
  const handleDeleteFoto = (fotoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFotos(fotos.filter(f => f.id !== fotoId));
  };

  // Efeito para salvar a vistoria ativa no localStorage quando ela mudar
  useEffect(() => {
    if (vistoriaAtiva) {
      // Salvar a vistoria ativa no localStorage para que outras páginas possam acessá-la
      localStorage.setItem('vistoriaAtiva', JSON.stringify({
        id: vistoriaAtiva.id,
        tipoVistoria: vistoriaAtiva.tipoVistoria,
        entryInspectionCode: vistoriaAtiva.entryInspectionCode || null
      }));
    } else {
      // Se não houver vistoria ativa, remover do localStorage
      localStorage.removeItem('vistoriaAtiva');
    }
  }, [vistoriaAtiva]);

  // Modificar a função que seleciona a vistoria ativa
  const handleSetVistoriaAtiva = (vistoria: VistoriaEstendida) => {
    setVistoriaAtiva(vistoria);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border h-screen fixed left-0 overflow-y-auto">
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
            <button
              onClick={() => setSidebarTab('local')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sidebarTab === 'local'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Local
            </button>
            <button
              onClick={() => setSidebarTab('finalizadas')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sidebarTab === 'finalizadas'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enviadas
            </button>
          </div>

          {/* Lista de Vistorias */}
          <div className="space-y-2">
            {vistoriasMock
              .filter(v => {
                // Exibir apenas vistorias de entrada e conferência
                return (v.tipoVistoria === 'entrada' || v.tipoVistoria === 'conferencia') && 
                  (sidebarTab === 'local' ? !v.sincronizado : v.sincronizado);
              })
              .map((vistoria) => (
                <button
                  key={vistoria.id}
                  onClick={() => handleSetVistoriaAtiva(vistoria)}
                  className={`w-full p-4 rounded-xl transition-all ${
                    vistoriaAtiva?.id === vistoria.id
                      ? 'bg-primary/5 border border-primary'
                      : 'bg-white hover:bg-gray-50 border border-border'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">{vistoria.codigo || '000'}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      {getTipoVistoriaIcon(vistoria.tipoVistoria)}
                      <span>{getTipoVistoriaText(vistoria.tipoVistoria)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{vistoria.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{vistoria.data}</span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 pl-64">
        {/* Header */}
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
                <h1 className="text-lg font-semibold text-gray-900">Capa da Vistoria</h1>
              </div>
              {vistoriaAtiva && (
                <button
                  onClick={handleSincronizarVistoria}
                  disabled={sincronizando || vistoriaAtiva.sincronizado}
                  className={`flex items-center gap-2 px-3 py-1.5 ${
                    vistoriaAtiva.sincronizado 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  } rounded-md transition-colors disabled:opacity-80 shadow-sm`}
                  title={vistoriaAtiva.sincronizado ? 'Vistoria já sincronizada' : 'Sincronizar vistoria'}
                >
                  {sincronizando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      <span className="text-sm">Sincronizando...</span>
                    </>
                  ) : vistoriaAtiva.sincronizado ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Sincronizada</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-sm">Sincronizar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Categorias de Fotos */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Categorias</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  onClick={() => handleCategoriaClick(categoria.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    categoriaSelecionada === categoria.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/30 hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-lg ${
                      categoriaSelecionada === categoria.id
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    } flex items-center justify-center`}>
                      {categoria.icon}
                    </div>
                    {categoria.id === 'ambientes' && ambientesComAlerta && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{categoria.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Fotos ou Lista de Medidores */}
          {categoriaSelecionada === 'medidor' ? (
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Medidores</h2>
                <button
                  onClick={() => setShowNovoMedidor(true)}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {getMedidoresPorTab().map((medidor) => (
                  <div
                    key={medidor.id}
                    className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {medidor.tipo === 'agua' ? (
                          <Droplets className="w-5 h-5 text-blue-500" />
                        ) : medidor.tipo === 'energia' ? (
                          <Zap className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Flame className="w-5 h-5 text-orange-500" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{medidor.identificacao}</h3>
                          <p className="text-sm text-gray-500">
                            Leitura: {medidor.numeroLeitura} {medidor.unidadeMedida}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {medidor.foto && (
                          <button
                            onClick={() => setSelectedImage(medidor.foto || null)}
                            className="p-2 text-gray-600 hover:text-primary transition-colors"
                          >
                            <ImageIcon className="w-5 h-5" />
                          </button>
                        )}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-border py-1 w-48">
                              <DropdownMenu.Item
                                onClick={() => {
                                  setShowNovoMedidor(true);
                                  const { id, ...rest } = medidor;
                                  setMedidorSelecionado(medidor);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este medidor?')) {
                                    setMedidores(prev => prev.filter(m => m.id !== medidor.id));
                                  }
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Fotos e Vídeos</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getFotosPorTab().map((foto) => (
                  <button
                    key={foto.id}
                    onClick={() => setSelectedImage(foto.url)}
                    className="relative aspect-square rounded-xl border border-border hover:border-primary/30 overflow-hidden group"
                  >
                    <Image
                      src={foto.url}
                      alt={foto.descricao || "Foto"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 bg-white rounded-full">
                        <ImageIcon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteFoto(foto.id, e)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    {foto.descricao && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm truncate">
                        {foto.descricao}
                      </div>
                    )}
                  </button>
                ))}
                
                <button
                  onClick={handleAddFoto}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-sm font-medium">
                    {categorias.find(c => c.id === categoriaSelecionada)?.nome}
                  </span>
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          )}

          {/* Parecer do Vistoriador */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parecer do Vistoriador</h2>
            <textarea
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Digite seu parecer sobre o estado geral do imóvel..."
            />
          </div>
        </main>
      </div>

      {/* Modal de Novo Medidor */}
      <NovoMedidorModal
        isOpen={showNovoMedidor}
        onClose={() => setShowNovoMedidor(false)}
        onAdd={handleAddMedidor}
        title="Adicionar Novo Medidor"
      />

      {/* Dialog para exibir imagem expandida */}
      <ImageDialog
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </div>
  );
}


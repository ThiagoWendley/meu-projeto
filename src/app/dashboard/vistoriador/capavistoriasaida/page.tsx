'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Plus, Image as ImageIcon, Zap, Key, X, Pencil, Trash2, MoreVertical, MapPin, Calendar, DoorOpen, DoorClosed, ClipboardCheck, Droplets, Flame, AlertCircle, Upload, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Vistoria } from '@/components/layout/SidebarVistoriador';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Toaster, toast } from 'sonner';

// Estendendo a interface Vistoria para incluir propriedades de tempo de execução
interface VistoriaEstendida extends Vistoria {
  tempoExecucaoInicio?: number | null;
  tempoExecucaoTotal?: number;
  emExecucao?: boolean;
  codigo?: string;
  tipoVistoria: 'entrada' | 'saida';
  entryInspectionCode?: string;
  totalFotos: number;
  totalVideos: number;
  sincronizado: boolean;
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

// Modal para adicionar ou editar medidor
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

// Mock data para vistorias de entrada (para comparação)
const vistoriaEntradaMock = {
  id: '3-entrada',
  titulo: 'Vistoria de Entrada - Apartamento 123',
  codigo: '456',
  endereco: 'Av. Paulista, 1000 - Apto 123',
  data: '10/01/2024',
  parecer: 'Imóvel em boas condições na entrada.',
  fotos: [
    {
      id: 'entrada-1',
      url: 'https://images.unsplash.com/photo-1564357645071-9726b104e25a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a2V5fGVufDB8fDB8fHww',
      tipo: 'chave' as const,
      descricao: 'Chave principal - entrada',
      referenciaEntradaId: undefined
    },
    {
      id: 'entrada-2',
      url: 'https://images.unsplash.com/photo-1570044488942-4dd0e879f516?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2F0ZXIlMjBtZXRlcnxlbnwwfHwwfHx8MA%3D%3D',
      tipo: 'medidor' as const,
      descricao: 'Medidor de água - entrada',
      referenciaEntradaId: undefined
    },
    {
      id: 'entrada-3',
      url: 'https://plus.unsplash.com/premium_photo-1676823570402-e5b3e9e733c9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZWxlY3RyaWMlMjBtZXRlcnxlbnwwfHwwfHx8MA%3D%3D',
      tipo: 'medidor' as const,
      descricao: 'Medidor de energia - entrada',
      referenciaEntradaId: undefined
    },
    {
      id: 'entrada-4',
      url: 'https://images.unsplash.com/photo-1527177924293-4aa21e549d2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW50ZXJpb3J8ZW58MHx8MHx8fDA%3D',
      tipo: 'outros' as const,
      descricao: 'Vista geral - entrada',
      referenciaEntradaId: undefined
    }
  ],
  medidores: [
    {
      id: 'medidor-entrada-1',
      tipo: 'agua' as const,
      identificacao: 'A123456',
      numeroLeitura: '12345',
      unidadeMedida: 'm³'
    },
    {
      id: 'medidor-entrada-2',
      tipo: 'energia' as const,
      identificacao: 'E789012',
      numeroLeitura: '67890',
      unidadeMedida: 'kWh'
    }
  ]
};

// Componente para exibir imagem em formato diagonal (entrada na diagonal superior, saída na diagonal inferior)
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
          <img
            src={entradaImageUrl}
            alt={entradaDescricao || "Foto da vistoria de entrada"}
            className="object-cover w-full h-full"
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
            <img
              src={saidaImageUrl}
              alt={saidaDescricao || "Foto da vistoria de saída"}
              className="object-cover w-full h-full"
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

export default function CapaVistoriaSaidaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [parecer, setParecer] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<'chave' | 'medidor' | 'outros' | 'ambientes'>('outros');
  const [sidebarTab, setSidebarTab] = useState<'local' | 'enviadas'>('local');
  const [vistoriaAtiva, setVistoriaAtiva] = useState<VistoriaEstendida | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [medidorSelecionado, setMedidorSelecionado] = useState<Medidor | null>(null);
  const [showNovoMedidor, setShowNovoMedidor] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [ambientesComAlerta, setAmbientesComAlerta] = useState(false);

  // Estado para controlar a tab ativa (sempre presente na vistoria de saída)
  const [vistoriaTab, setVistoriaTab] = useState<'entrada' | 'saida'>('saida');
  const [fotoReferenciaId, setFotoReferenciaId] = useState<string | null>(null);
  const [vistoriaId, setVistoriaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryInspectionCode, setEntryInspectionCode] = useState<string | null>(null);

  // Lista de categorias
  const categorias = [
    { id: 'chave', nome: 'Chaves', icon: <Key className="w-5 h-5 text-amber-500" />, bgColor: 'bg-amber-50' },
    { id: 'medidor', nome: 'Medidores', icon: <Zap className="w-5 h-5 text-purple-500" />, bgColor: 'bg-purple-50' },
    { id: 'outros', nome: 'Outros', icon: <ImageIcon className="w-5 h-5 text-blue-500" />, bgColor: 'bg-blue-50' },
    { id: 'ambientes', nome: 'Ambientes', icon: <DoorOpen className="w-5 h-5 text-green-500" />, bgColor: 'bg-green-50' },
  ];

  // Dados mockados para vistoria de saída
  const vistoriasMock: VistoriaEstendida[] = [
    {
      id: '2',
      titulo: 'Casa 456',
      codigo: '571',
      endereco: 'Rua Augusta, 500',
      data: '26/03/2024',
      status: 'Em andamento',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      imobiliaria: 'Imobiliária Alpha',
      tipoImovel: 'Casa',
      tipoVistoria: 'saida',
      mobilia: 'mobiliado',
      area: '75.5 m²',
      totalFotos: 32,
      totalVideos: 1,
      sincronizado: true,
      entryInspectionCode: '533'
    },
    {
      id: '3',
      titulo: 'Vistoria de Saída - Apartamento 123',
      codigo: '572',
      endereco: 'Rua Oscar Freire, 800 - Apto 301',
      data: '28/03/2024',
      status: 'Pendente',
      coordenadas: { lat: -23.5616, lng: -46.6721 },
      imobiliaria: 'Imobiliária Premium',
      tipoImovel: 'Apartamento',
      tipoVistoria: 'saida',
      mobilia: 'semi_mobiliado',
      area: '85.0 m²',
      totalFotos: 0,
      totalVideos: 0,
      sincronizado: false,
      entryInspectionCode: '456'
    }
  ];

  useEffect(() => {
    // Verificar se o parâmetro vistoriaId existe na URL
    const vistoriaIdParam = searchParams?.get('vistoriaId');
    
    if (!vistoriaIdParam) {
      // Se não existir, redirecionar para a página principal de vistorias
      router.push('/dashboard/vistoriador');
      return;
    }
    
    setVistoriaId(vistoriaIdParam);
    
    // Carregar a vistoria ativa do mock ou do localStorage
    const vistoriaEncontrada = vistoriasMock.find(v => v.id === vistoriaIdParam);
    
    if (vistoriaEncontrada) {
      setVistoriaAtiva(vistoriaEncontrada);
      setEntryInspectionCode(vistoriaEncontrada.entryInspectionCode || null);
      
      // Armazenar no localStorage para ser acessível em outras páginas
      localStorage.setItem('vistoriaAtiva', JSON.stringify({
        id: vistoriaEncontrada.id,
        tipoVistoria: 'saida',
        entryInspectionCode: vistoriaEncontrada.entryInspectionCode || null
      }));
    } else {
      // Se a vistoria não for encontrada, verificar no localStorage
      try {
        const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
        if (vistoriaAtivaString) {
          const vistoriaAtivaData = JSON.parse(vistoriaAtivaString);
          if (vistoriaAtivaData && vistoriaAtivaData.tipoVistoria === 'saida') {
            // Criar uma vistoria mock baseada nos dados do localStorage
            const vistoriaMock: VistoriaEstendida = {
              id: vistoriaAtivaData.id,
              titulo: `Vistoria de Saída - ID: ${vistoriaAtivaData.id}`,
              status: 'Em andamento',
              tipoVistoria: 'saida',
              entryInspectionCode: vistoriaAtivaData.entryInspectionCode || null,
              // Adicionar propriedades obrigatórias com valores padrão
              endereco: 'Endereço não disponível',
              data: new Date().toLocaleDateString('pt-BR'),
              coordenadas: { lat: 0, lng: 0 },
              imobiliaria: 'N/A',
              tipoImovel: 'N/A',
              mobilia: 'vazio',
              area: 'N/A',
              totalFotos: 0,
              totalVideos: 0,
              sincronizado: false
            };
            setVistoriaAtiva(vistoriaMock);
            setEntryInspectionCode(vistoriaAtivaData.entryInspectionCode || null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar vistoria ativa:', error);
      }
    }
    
    setLoading(false);
  }, [searchParams, router]);

  // Função para obter as fotos com base na aba selecionada (entrada ou saída)
  const getFotosPorTab = () => {
    if (vistoriaTab === 'entrada') {
      return vistoriaEntradaMock.fotos.filter(foto => foto.tipo === categoriaSelecionada);
    } else {
      return fotos.filter(foto => foto.tipo === categoriaSelecionada);
    }
  };

  // Função para obter o parecer com base na aba selecionada
  const getParecerPorTab = () => {
    if (vistoriaTab === 'entrada') {
      return vistoriaEntradaMock.parecer;
    } else {
      return parecer;
    }
  };

  // Função para obter os medidores com base na aba selecionada
  const getMedidoresPorTab = () => {
    if (vistoriaTab === 'entrada') {
      return vistoriaEntradaMock.medidores;
    } else {
      return medidores;
    }
  };

  const handleVoltar = () => {
    router.push('/dashboard/vistoriador');
  };

  const handleCategoriaClick = (categoriaId: string) => {
    if (categoriaId === 'ambientes') {
      const params = new URLSearchParams();
      if (vistoriaAtiva) {
        params.append('vistoriaId', vistoriaAtiva.id);
      }
      router.push(`/dashboard/vistoriador/ambientesaida?${params.toString()}`);
    } else {
      setCategoriaSelecionada(categoriaId as any);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Processar os arquivos selecionados
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const novaFoto: Foto = {
            id: Math.random().toString(),
            url: result,
            tipo: categoriaSelecionada,
            referenciaEntradaId: fotoReferenciaId || undefined,
            medidorId: medidorSelecionado?.id // Se tiver um medidor selecionado, vincular a foto
          };
          
          setFotos(prev => [...prev, novaFoto]);
          setFotoReferenciaId(null); // Limpar a referência após uso
        }
      };
      reader.readAsDataURL(file);
    });

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Função para adicionar uma nova foto com referência a uma foto de entrada
  const handleAddFotoComReferencia = (fotoEntradaId: string) => {
    const fotoEntrada = vistoriaEntradaMock.fotos.find(f => f.id === fotoEntradaId);
    
    // Abre o seletor de arquivos
    fileInputRef.current?.click();
    
    // Seria necessário salvar essa relação entre a foto nova e a antiga
    setFotoReferenciaId(fotoEntradaId);
  };

  // Função para deletar uma foto
  const handleDeleteFoto = (fotoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFotos(fotos.filter(f => f.id !== fotoId));
  };

  // Função para adicionar um novo medidor
  const handleAddMedidor = (novoMedidor: Omit<Medidor, 'id'>) => {
    if (isEditMode && medidorSelecionado) {
      // Editar medidor existente
      const medidoresAtualizados = medidores.map(m => 
        m.id === medidorSelecionado.id 
        ? { ...m, ...novoMedidor } 
        : m
      );
      setMedidores(medidoresAtualizados);
      setMedidorSelecionado(null);
      setIsEditMode(false);
    } else {
      // Adicionar novo medidor
      const medidor: Medidor = {
        id: Math.random().toString(),
        ...novoMedidor,
        foto: undefined
      };
      setMedidores([...medidores, medidor]);
    }
  };

  // Função para excluir um medidor
  const handleDeleteMedidor = (medidorId: string) => {
    setMedidores(medidores.filter(m => m.id !== medidorId));
  };

  // Função para editar um medidor
  const handleEditMedidor = (medidor: Medidor) => {
    setMedidorSelecionado(medidor);
    setIsEditMode(true);
    setShowNovoMedidor(true);
  };

  // Funções auxiliares para os elementos da sidebar
  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-200';
      case 'Em andamento':
        return 'bg-blue-200';
      case 'Concluído':
        return 'bg-green-200';
      default:
        return 'bg-gray-200';
    }
  };

  // Função para obter o ícone do tipo de vistoria
  const getTipoVistoriaIcon = (tipo: 'entrada' | 'saida' | 'conferencia') => {
    switch (tipo) {
      case 'entrada':
        return <DoorOpen className="w-4 h-4 text-emerald-600" />;
      case 'saida':
        return <DoorClosed className="w-4 h-4 text-orange-600" />;
      case 'conferencia':
        return <ClipboardCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  // Função para obter o texto do tipo de vistoria
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

  // Filtra as vistorias com base no status de sincronização
  const vistoriasFiltradas = vistoriasMock.filter(vistoria => 
    sidebarTab === 'local' ? !vistoria.sincronizado : vistoria.sincronizado
  );

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
      {/* Sidebar esquerda - idêntica à da tela principal */}
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
              onClick={() => setSidebarTab('enviadas')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sidebarTab === 'enviadas'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enviadas
            </button>
          </div>

          {/* Lista de vistorias */}
          <div className="space-y-2">
            <div className="mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Vistorias
              </h2>
            </div>
            
            {vistoriasFiltradas.map((vistoria) => (
              <button
                key={vistoria.id}
                onClick={() => {
                  const params = new URLSearchParams();
                  params.append('vistoriaId', vistoria.id);
                  router.push(`/dashboard/vistoriador/capavistoriasaida?${params.toString()}`);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  vistoriaAtiva?.id === vistoria.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-primary/30 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(vistoria.status)}`} />
                      <span className="font-medium text-gray-900 text-sm">{vistoria.codigo || '000'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      {getTipoVistoriaIcon(vistoria.tipoVistoria)}
                      <span>{getTipoVistoriaText(vistoria.tipoVistoria)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{vistoria.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{vistoria.data}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 pl-64">
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
              
              {/* Botão de sincronização */}
              <button
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Sincronizar</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Categorias */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Categorias</h2>
              {entryInspectionCode && (
                <p className="text-sm text-gray-500">Cód. vistoria de entrada: <span className="font-medium">{entryInspectionCode}</span></p>
              )}
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
                  </div>
                  <span className="text-sm font-medium">{categoria.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs Entrada/Saída - SEMPRE VISÍVEL nesta tela */}
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
            
          {/* Conteúdo baseado na categoria selecionada */}
          {categoriaSelecionada !== 'ambientes' && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              {/* Cabeçalho do card */}
              <div className="p-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categoriaSelecionada === 'chave' 
                      ? 'Chaves' 
                      : categoriaSelecionada === 'medidor' 
                        ? 'Medidores' 
                        : 'Outros'}
                  </h2>
                  
                  {/* Botão de adicionar medidor quando a categoria for medidores e estiver na aba de saída */}
                  {categoriaSelecionada === 'medidor' && vistoriaTab === 'saida' && (
                    <button
                      onClick={() => setShowNovoMedidor(true)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Conteúdo do card */}
              <div className="p-4">
                {/* Se a categoria for medidores e estiver na aba de saída, exibir a lista de medidores */}
                {categoriaSelecionada === 'medidor' ? (
                  <div>
                    {/* Lista de medidores */}
                    <div className="space-y-3">
                      {getMedidoresPorTab().map((medidor) => (
                        <div 
                          key={medidor.id} 
                          className="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                {medidor.tipo === 'agua' && <Droplets className="w-4 h-4 text-blue-500" />}
                                {medidor.tipo === 'energia' && <Zap className="w-4 h-4 text-yellow-500" />}
                                {medidor.tipo === 'gas' && <Flame className="w-4 h-4 text-orange-500" />}
                                <h4 className="font-medium text-sm">
                                  {medidor.tipo === 'agua' ? 'Água' : medidor.tipo === 'energia' ? 'Energia' : 'Gás'} - {medidor.identificacao}
                                </h4>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                <span>Leitura: {medidor.numeroLeitura} {medidor.unidadeMedida}</span>
                              </div>
                            </div>
                            
                            {/* Menu de opções do medidor */}
                            {vistoriaTab === 'saida' && (
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden min-w-[150px] z-50">
                                    <DropdownMenu.Item
                                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                      onClick={() => handleEditMedidor(medidor)}
                                    >
                                      <Pencil className="w-4 h-4 text-blue-500" />
                                      <span>Editar</span>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                      onClick={() => handleDeleteMedidor(medidor.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Excluir</span>
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {getMedidoresPorTab().length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500">
                          Nenhum medidor encontrado
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Lista de fotos - apenas para as categorias que não são medidores */
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Fotos</h3>
                      {vistoriaTab === 'saida' && categoriaSelecionada !== 'chave' && categoriaSelecionada !== 'outros' && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Grid de fotos - Agora usando o componente DiagonalImageCard quando em modo saída */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {/* Quando estiver na aba de entrada, mostrar fotos simples */}
                      {vistoriaTab === 'entrada' && getFotosPorTab().map((foto) => (
                        <div 
                          key={foto.id}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedImage(foto.url)}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={foto.url} 
                              alt={foto.descricao || 'Foto'} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Quando estiver na aba de saída, usar o componente diagonal */}
                      {vistoriaTab === 'saida' && (
                        <>
                          {/* Mapear as fotos de entrada que podem ter correspondência com fotos de saída */}
                          {vistoriaEntradaMock.fotos
                            .filter(fotoEntrada => fotoEntrada.tipo === categoriaSelecionada)
                            .map(fotoEntrada => {
                              // Procura uma foto de saída correspondente
                              const fotoSaida = fotos.find(f => f.referenciaEntradaId === fotoEntrada.id);

                              return (
                                <DiagonalImageCard
                                  key={fotoEntrada.id}
                                  entradaImageUrl={fotoEntrada.url}
                                  saidaImageUrl={fotoSaida?.url}
                                  onAddSaidaImage={() => handleAddFotoComReferencia(fotoEntrada.id)}
                                  onViewImage={setSelectedImage}
                                  onDeleteSaidaImage={fotoSaida ? (e) => handleDeleteFoto(fotoSaida.id, e) : undefined}
                                  entradaDescricao={fotoEntrada.descricao}
                                  saidaDescricao={fotoSaida?.descricao}
                                  entradaId={fotoEntrada.id}
                                />
                              );
                            })
                          }
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Input escondido para seleção de arquivos */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*"
            multiple
          />

          {/* Parecer do vistoriador - sempre visível independente da categoria */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-gray-900">Parecer do Vistoriador</h2>
            </div>
            <div className="p-4">
              <textarea
                className={`w-full p-3 rounded-lg border ${
                  vistoriaTab === 'entrada' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                } focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                placeholder="Descreva o estado geral do imóvel..."
                rows={4}
                value={getParecerPorTab()}
                onChange={(e) => setParecer(e.target.value)}
                readOnly={vistoriaTab === 'entrada'}
              />
            </div>
          </div>
        </main>
      </div>
      
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
      
      <Toaster position="top-center" />
      
      {/* Modal para adicionar novo medidor */}
      <NovoMedidorModal
        isOpen={showNovoMedidor}
        onClose={() => {
          setShowNovoMedidor(false);
          setIsEditMode(false);
          setMedidorSelecionado(null);
        }}
        onAdd={handleAddMedidor}
        initialData={isEditMode && medidorSelecionado ? {
          tipo: medidorSelecionado.tipo,
          identificacao: medidorSelecionado.identificacao,
          numeroLeitura: medidorSelecionado.numeroLeitura,
          unidadeMedida: medidorSelecionado.unidadeMedida,
          foto: medidorSelecionado.foto
        } : undefined}
        title={isEditMode ? "Editar Medidor" : "Adicionar Novo Medidor"}
      />
    </div>
  );
} 
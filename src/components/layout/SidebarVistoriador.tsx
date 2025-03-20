'use client';

import { useState } from 'react';
import { LogOut, Settings, Sparkles, ClipboardList, MoreVertical, Save, Copy, BookMarked, X, Home, MapPin, Calendar, DoorOpen, DoorClosed, ClipboardCheck, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export interface Vistoria {
  id: string;
  titulo: string;
  codigo?: string;
  sequentialCode?: string;
  endereco: string;
  data: string;
  status: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  imobiliaria: string;
  tipoImovel: string;
  tipoVistoria: 'entrada' | 'saida' | 'conferencia';
  mobilia: 'vazio' | 'semi_mobiliado' | 'mobiliado' | 'super_mobiliado';
  area: string;
  totalFotos: number;
  totalVideos: number;
  informacoesAdicionais?: string;
  documentosAnexados?: Array<{
    nome: string;
    url: string;
  }>;
  sincronizado: boolean;
  entryInspectionCode?: string;
}

// Adicionando interface para Modelo
export interface ModeloVistoria extends Omit<Vistoria, 'id' | 'data' | 'status' | 'sincronizado'> {
  id: string;
  nome: string;
  dataCriacao: string;
}

interface ModeloDisplay {
  id: string;
  nome: string;
  dataCriacao: string;
}

interface SidebarVistoriadorProps {
  isOpen: boolean;
  onClose: () => void;
  activeVistoriaId?: string;
  onVistoriaClick: (id: string) => void;
  onSettingsClick: () => void;
  showSettings?: boolean;
  activeTab: 'local' | 'enviadas';
  onTabChange: (tab: 'local' | 'enviadas') => void;
  modelos?: ModeloDisplay[];
  onModeloClick?: (modeloId: string) => void;
  activeModeloId?: string;
}

// Funções auxiliares para ícones e textos dos tipos de vistoria
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

// Dados simulados de vistorias
export const vistorias: Vistoria[] = [
  {
    id: '1',
    titulo: 'Apartamento 123',
    codigo: '570',
    sequentialCode: '001',
    endereco: 'Av. Paulista, 1000 - Apto 123',
    data: '25/03/2024',
    status: 'Pendente',
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    imobiliaria: 'Imobiliária Premium',
    tipoImovel: 'Apartamento',
    tipoVistoria: 'entrada',
    mobilia: 'vazio',
    area: '100.0 m²',
    totalFotos: 45,
    totalVideos: 2,
    informacoesAdicionais: 'Chaves disponíveis na portaria. Contato do síndico: (21) 99999-9999',
    documentosAnexados: [
      { nome: 'Contrato.pdf', url: '/docs/contrato.pdf' }
    ],
    sincronizado: false
  },
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
    informacoesAdicionais: 'Agendar com proprietário pelo telefone (21) 88888-8888',
    sincronizado: true,
    entryInspectionCode: '533'
  },
  {
    id: '3',
    titulo: 'Apartamento 789',
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
    informacoesAdicionais: 'Vistoria de saída para o imóvel. Contato do inquilino: (11) 97777-7777',
    sincronizado: false,
    entryInspectionCode: '456'
  }
];

// Mock data para modelos
export let modelosVistoria: ModeloVistoria[] = [
  {
    id: 'modelo-1',
    nome: 'Apartamento 2 Quartos',
    dataCriacao: '20/03/2024',
    titulo: 'Modelo - Apto 2Q',
    endereco: '',
    coordenadas: { lat: 0, lng: 0 },
    imobiliaria: '',
    tipoImovel: 'Apartamento',
    tipoVistoria: 'entrada',
    mobilia: 'vazio',
    area: '',
    totalFotos: 0,
    totalVideos: 0,
    informacoesAdicionais: 'Modelo para apartamentos de 2 quartos'
  },
  {
    id: 'modelo-2',
    nome: 'Casa com Quintal',
    dataCriacao: '22/03/2024',
    titulo: 'Modelo - Casa',
    endereco: '',
    coordenadas: { lat: 0, lng: 0 },
    imobiliaria: '',
    tipoImovel: 'Casa',
    tipoVistoria: 'saida',
    mobilia: 'vazio',
    area: '',
    totalFotos: 0,
    totalVideos: 0,
    informacoesAdicionais: 'Modelo para casas com quintal'
  }
];

// Função para adicionar um novo modelo
export const adicionarModelo = (vistoria: Vistoria, nome: string, descricao: string) => {
  const novoModelo: ModeloVistoria = {
    id: `modelo-${Date.now()}`,
    nome: nome,
    dataCriacao: new Date().toLocaleDateString('pt-BR'),
    titulo: `Modelo - ${nome}`,
    endereco: '',
    coordenadas: { lat: 0, lng: 0 },
    imobiliaria: '',
    tipoImovel: vistoria.tipoImovel,
    tipoVistoria: vistoria.tipoVistoria,
    mobilia: vistoria.mobilia,
    area: '',
    totalFotos: 0,
    totalVideos: 0,
    informacoesAdicionais: descricao
  };

  modelosVistoria = [...modelosVistoria, novoModelo];
  return novoModelo;
};

interface ModelMenuProps {
  onSaveAsModel: () => void;
  onApplyModel: () => void;
}

function ModelMenu({ onSaveAsModel, onApplyModel }: ModelMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-border p-1 min-w-[180px] z-[1600]">
          <DropdownMenu.Item asChild>
            <button
              onClick={onApplyModel}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" />
              Aplicar modelo
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <button
              onClick={onSaveAsModel}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar como modelo
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface ApplyModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyModel: (modelId: string) => void;
  models: ModeloDisplay[];
}

function ApplyModelDialog({ isOpen, onClose, onApplyModel, models }: ApplyModelDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1600]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[1601] p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Aplicar Modelo
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onApplyModel(model.id);
                  onClose();
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface SaveModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

function SaveModelDialog({ isOpen, onClose, onSave }: SaveModelDialogProps) {
  const [modelName, setModelName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelName.trim()) {
      onSave(modelName);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1600]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[1601] p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Salvar como Modelo
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Modelo
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
                placeholder="Ex: Apartamento 2 Quartos"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                Salvar Modelo
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function SidebarVistoriador({
  isOpen,
  onClose,
  activeVistoriaId,
  onVistoriaClick,
  onSettingsClick,
  showSettings = false,
  activeTab,
  onTabChange,
  modelos,
  onModeloClick,
  activeModeloId
}: SidebarVistoriadorProps) {
  const router = useRouter();
  const [isApplyModelOpen, setIsApplyModelOpen] = useState(false);
  const [isSaveModelOpen, setIsSaveModelOpen] = useState(false);
  const [selectedVistoriaId, setSelectedVistoriaId] = useState<string | null>(null);

  const handleSaveAsModel = (vistoriaId: string) => {
    setSelectedVistoriaId(vistoriaId);
    setIsSaveModelOpen(true);
  };

  const handleApplyModel = (vistoriaId: string) => {
    setSelectedVistoriaId(vistoriaId);
    setIsApplyModelOpen(true);
  };

  const handleSaveModel = (name: string) => {
    // Aqui você implementaria a lógica para salvar o modelo
    console.log('Salvando modelo:', name);
    setIsSaveModelOpen(false);
  };

  const handleApplyModelToVistoria = (modelId: string) => {
    // Aqui você implementaria a lógica para aplicar o modelo
    console.log('Aplicando modelo:', modelId);
    setIsApplyModelOpen(false);
  };

  // Filtra as vistorias com base no status de sincronização
  const vistoriasFiltradas = vistorias.filter(vistoria => 
    activeTab === 'local' ? !vistoria.sincronizado : vistoria.sincronizado
  );

  // Usa os modelos passados como prop, ou os modelos locais como fallback
  const modelosParaExibir = modelos || modelosVistoria.map(m => ({
    id: m.id,
    nome: m.nome,
    dataCriacao: m.dataCriacao
  }));

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

  return (
    <>
      {/* Overlay móvel */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1400] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border transform transition-transform duration-300 z-[1500] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-light to-primary flex items-center justify-center overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_transparent_50%,_rgba(255,255,255,0.2)_100%)]"></div>
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-inter)' }}>EV</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Evolução
              </span>
              <span className="block text-sm text-gray-600">Vistoria</span>
            </div>
          </div>
        </div>

        {/* Tabs de Filtro */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => onTabChange('local')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'local'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Local
            </button>
            <button
              onClick={() => onTabChange('enviadas')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'enviadas'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enviadas
            </button>
          </div>
        </div>

        {/* Lista de Vistorias */}
        <div className="py-4 flex flex-col h-[calc(100%-4rem)]">
          <div className="px-4 mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Vistorias
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {vistoriasFiltradas.map((vistoria) => (
              <button
                key={vistoria.id}
                onClick={() => onVistoriaClick(vistoria.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  activeVistoriaId === vistoria.id
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

          {/* Seção de Modelos */}
          <div className="px-4 pt-4 border-t border-border">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Modelos
            </h2>
            <div className="max-h-[150px] overflow-y-auto pr-1 space-y-2">
              {modelosParaExibir.map((modelo) => (
                <button
                  key={modelo.id}
                  onClick={() => onModeloClick && onModeloClick(modelo.id)}
                  className={`w-full p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    activeModeloId === modelo.id 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  <div className="text-left">
                    <span className="text-sm font-medium block">{modelo.nome}</span>
                    <span className="text-xs text-gray-500">{modelo.dataCriacao}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="mt-auto mx-4 mb-6 pt-4 flex flex-col gap-2 border-t border-border">
            <button
              onClick={onSettingsClick}
              className={`flex items-center gap-2 text-sm ${
                showSettings
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors group px-3 py-2 rounded-lg hover:bg-gray-50`}
            >
              <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
              <span>Configurações</span>
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay para fechar em telas menores */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[999] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Modal de Aplicar Modelo */}
      <ApplyModelDialog
        isOpen={isApplyModelOpen}
        onClose={() => setIsApplyModelOpen(false)}
        onApplyModel={handleApplyModelToVistoria}
        models={modelosParaExibir}
      />

      {/* Modal de Salvar Modelo */}
      <SaveModelDialog
        isOpen={isSaveModelOpen}
        onClose={() => setIsSaveModelOpen(false)}
        onSave={handleSaveModel}
      />
    </>
  );
} 
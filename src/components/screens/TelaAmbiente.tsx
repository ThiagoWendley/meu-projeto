import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, X, Camera, Home, ChevronRight, GripVertical, Trash2, Copy, Edit3, Check, MoreVertical, PlusCircle, Pencil, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

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

interface VistoriaEntrada {
  ambientes: {
    [ambienteId: string]: {
      fotos: Foto[];
      observacoes: string;
    }
  };
}

interface ReferenceImageProps {
  imageUrl: string;
  onClick: () => void;
  categoria: string;
  descricao?: string;
}

interface NovoAmbienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ambiente: Omit<Ambiente, 'id' | 'status' | 'itens' | 'fotos' | 'ordem'>) => void;
  initialData?: Omit<Ambiente, 'id' | 'status' | 'itens' | 'fotos' | 'ordem'>;
  title: string;
}

interface ImagemExpandidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (imagemEditada: string) => void;
}

interface NovoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { nome: string; tipo: string }) => void;
}

// Estrutura para armazenar um template de ambiente
interface AmbienteTemplate {
  id: string;
  nome: string;
  tipo: string;
}

// Estrutura para armazenar um template de item
interface ItemTemplate {
  id: string;
  nome: string;
  tipo: string;
}

// Constantes para as chaves do localStorage
const STORAGE_KEY_AMBIENTES = 'evolucao_vistoria_ambientes';

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
              <span>{mostrarFormularioCriacao ? 'Cancelar' : 'Criar novo ambiente'}</span>
            </button>
          </div>
          
          {/* Formulário de criação de ambiente (inicialmente oculto) */}
          {mostrarFormularioCriacao && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
              <h3 className="text-sm font-medium text-gray-700">Criar novo ambiente:</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Ambiente
                </label>
                <input
                  type="text"
                  value={nomeAmbiente}
                  onChange={(e) => setNomeAmbiente(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: Sala de Jantar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo do Ambiente
                </label>
                <div className="flex items-center gap-2">
                  {!showNovoTipo ? (
                    <>
                      <select
                        value={tipoAmbiente}
                        onChange={(e) => setTipoAmbiente(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Selecione um tipo</option>
                        {tiposAmbiente.map((tipo) => (
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
                        placeholder="Novo tipo de ambiente"
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
              onClick={handleAdicionarAmbientesSelecionados}
              disabled={ambientesSelecionados.length === 0}
              className={`px-4 py-2 bg-primary text-white rounded-lg transition-colors ${
                ambientesSelecionados.length === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary-light'
              }`}
            >
              Adicionar {ambientesSelecionados.length > 0 ? `(${ambientesSelecionados.length})` : ''}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImagemExpandidaModal({ isOpen, onClose, imageUrl, onSave }: ImagemExpandidaModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [linhas, setLinhas] = useState<Array<{ points: Array<{ x: number; y: number }> }>>([]);
  const [linhaAtual, setLinhaAtual] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.lineCap = 'round';
    context.strokeStyle = '#ff0000';
    context.lineWidth = 3;
    contextRef.current = context;

    const image = document.createElement('img');
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    image.onload = () => {
      const ratio = Math.min(
        canvas.width / image.width,
        canvas.height / image.height
      );
      const width = image.width * ratio;
      const height = image.height * ratio;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      context.drawImage(image, x, y, width, height);
      
      linhas.forEach(linha => {
        context.beginPath();
        linha.points.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.stroke();
      });
    };
  }, [imageUrl, linhas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setLinhaAtual([{ x, y }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    context.lineTo(x, y);
    context.stroke();
    setLinhaAtual(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing && linhaAtual.length > 0) {
      setLinhas(prev => [...prev, { points: linhaAtual }]);
      setLinhaAtual([]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (linhas.length > 0) {
      setLinhas(prev => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imagemEditada = canvas.toDataURL('image/png');
      onSave(imagemEditada);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[1100]" />
        <Dialog.Content className="fixed inset-0 z-[1101] flex items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleUndo}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="touch-none"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

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
  
  // Novos estados
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
  
  // Nova função para selecionar/deselecionar um item
  const toggleSelecaoItem = (id: string) => {
    setItensSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };
  
  // Nova função para adicionar os itens selecionados
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
  
  // Nova função para excluir um item template
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

// Componente para exibir a imagem de referência da vistoria de entrada na diagonal
function ReferenceImage({ imageUrl, onClick, categoria, descricao }: ReferenceImageProps) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-gray-50 flex items-center justify-center"
    >
      {/* Divisão diagonal simulada */}
      <div className="absolute inset-0">
        {/* Área vazia (metade inferior esquerda) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100"></div>
        
        {/* Área com padrão colorido (metade superior direita) - substitui a imagem */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 100% 100%)',
            background: `repeating-linear-gradient(
              45deg,
              #f0f9ff,
              #f0f9ff 10px,
              #e6f2ff 10px,
              #e6f2ff 20px
            )`
          }}
        >
          {/* Imagem na parte superior direita */}
          <Image
            src={imageUrl}
            alt="Referência da vistoria de entrada"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Linha divisória diagonal */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom right, transparent calc(50% - 1px), #9CA3AF, transparent calc(50% + 1px))'
          }}
        ></div>
      </div>

      {/* Ícone e texto para adicionar nova foto */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-gray-600 group-hover:text-gray-900 transition-colors p-4">
        <Camera className="w-8 h-8" />
        <span className="text-sm font-medium text-center">
          Adicionar foto correspondente
        </span>
        {descricao && (
          <span className="text-xs text-gray-500 text-center max-w-[90%] truncate">
            Ref: {descricao}
          </span>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export default function TelaAmbiente() {
  const router = useRouter();
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<Ambiente | null>(null);
  const [showNovoAmbiente, setShowNovoAmbiente] = useState(false);
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<string[]>([]);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [ambienteParaEditar, setAmbienteParaEditar] = useState<Ambiente | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAmbiente, setDraggedAmbiente] = useState<Ambiente | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [itensDoBanco, setItensDoBanco] = useState<Item[]>([]);
  const [itensDoAmbiente, setItensDoAmbiente] = useState<Item[]>([]);
  const [modoSelecaoImagens, setModoSelecaoImagens] = useState(false);
  const [imagensSelecionadas, setImagensSelecionadas] = useState<string[]>([]);
  
  // Estado para controlar qual botão de comparação está selecionado
  const [comparacaoSelecionada, setComparacaoSelecionada] = useState<'igual' | 'diferente' | null>(null);

  // Função para carregar ambientes do localStorage
  const carregarAmbientesDoLocalStorage = () => {
    try {
      const ambientesArmazenados = localStorage.getItem('ambientes');
      if (ambientesArmazenados) {
        const ambientesParsed = JSON.parse(ambientesArmazenados);
        setAmbientes(ambientesParsed);
        
        // Verificar se há um ambienteId na URL
        const queryParams = new URLSearchParams(window.location.search);
        const ambienteIdParam = queryParams.get('ambienteId');
        
        // Se houver um ambienteId na URL, selecionar o ambiente correspondente
        if (ambienteIdParam) {
          const ambienteEncontrado = ambientesParsed.find(
            (ambiente: Ambiente) => ambiente.id === ambienteIdParam
          );
          
          if (ambienteEncontrado) {
            setAmbienteSelecionado(ambienteEncontrado);
          }
        } else if (ambientesParsed.length > 0) {
          // Se não houver ambienteId na URL e existirem ambientes, selecionar o primeiro
          setAmbienteSelecionado(ambientesParsed[0]);
        }
      } else {
        // Dados iniciais para teste caso não haja dados armazenados
        const ambientesIniciais: Ambiente[] = [
          {
            id: '1',
            nome: 'Sala de Estar',
            tipo: 'Sala',
            status: 'pendente' as const,
            itens: [],
            fotos: [],
            observacoes: '',
            ordem: 0
          },
          {
            id: '2',
            nome: 'Cozinha',
            tipo: 'Cozinha',
            status: 'pendente' as const,
            itens: [],
            fotos: [],
            observacoes: '',
            ordem: 1
          }
        ];
        setAmbientes(ambientesIniciais);
        setAmbienteSelecionado(ambientesIniciais[0]);
        
        // Verificar se há um ambienteId na URL
        const queryParams = new URLSearchParams(window.location.search);
        const ambienteIdParam = queryParams.get('ambienteId');
        
        // Se houver um ambienteId na URL, selecionar o ambiente correspondente
        if (ambienteIdParam) {
          const ambienteEncontrado = ambientesIniciais.find(
            (ambiente: Ambiente) => ambiente.id === ambienteIdParam
          );
          
          if (ambienteEncontrado) {
            setAmbienteSelecionado(ambienteEncontrado);
          }
        }
        
        // Salvar os ambientes iniciais no localStorage
        localStorage.setItem('ambientes', JSON.stringify(ambientesIniciais));
      }
    } catch (error) {
      console.error("Erro ao carregar ambientes:", error);
      toast.error("Erro ao carregar ambientes");
    }
  };

  // Função para carregar itens do localStorage
  const carregarItensDoLocalStorage = () => {
    try {
      const itensArmazenados = localStorage.getItem('itens');
      if (itensArmazenados) {
        const itensParsed = JSON.parse(itensArmazenados);
        setItensDoBanco(itensParsed);
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    }
  };

  useEffect(() => {
    // Carregar ambientes e itens
    carregarAmbientesDoLocalStorage();
    carregarItensDoLocalStorage();
  }, []);

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

  // Função para salvar ambientes no localStorage sempre que houver alterações
  useEffect(() => {
    if (ambientes.length > 0) {
      localStorage.setItem('ambientes', JSON.stringify(ambientes));
    }
  }, [ambientes]);

  const handleVoltar = () => {
    // Sempre redirecionar de volta para a página de vistoria
    router.push('/dashboard/vistoriador/vistoriar');
  };

  const handleAddAmbiente = (novoAmbiente: Omit<Ambiente, 'id' | 'status' | 'itens' | 'fotos' | 'ordem'>) => {
    if (ambienteParaEditar) {
      const ambientesAtualizados = ambientes.map(amb => 
        amb.id === ambienteParaEditar.id 
          ? { ...amb, nome: novoAmbiente.nome, tipo: novoAmbiente.tipo }
          : amb
      );
      
      setAmbientes(ambientesAtualizados);
      setAmbienteParaEditar(null);
    } else {
      const ambiente: Ambiente = {
        id: Math.random().toString(),
        ...novoAmbiente,
        status: 'pendente',
        itens: [],
        fotos: [],
        ordem: ambientes.length
      };
      
      setAmbientes(prev => [...prev, ambiente]);
    }
    setShowNovoAmbiente(false);
  };

  const handleLongPress = (ambiente: Ambiente) => {
    setModoSelecao(true);
    setAmbientesSelecionados([ambiente.id]);
  };
  
  const handleTouchStart = (ambiente: Ambiente) => {
    // Inicia um timer quando o usuário pressiona o ambiente
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(ambiente);
    }, 500); // 500ms é um tempo comum para long press
  };
  
  const handleTouchEnd = () => {
    // Cancela o timer se o usuário soltar antes do tempo de long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  const handleTouchMove = () => {
    // Cancela o timer se o usuário mover o dedo durante o long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  // Adicionar um manipulador de eventos alternativo para desktop usando mousedown/mouseup
  const handleMouseDown = (ambiente: Ambiente) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(ambiente);
    }, 500);
  };
  
  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCardClick = (ambiente: Ambiente) => {
    if (modoSelecao) {
      setAmbientesSelecionados(prev => 
        prev.includes(ambiente.id)
          ? prev.filter(id => id !== ambiente.id)
          : [...prev, ambiente.id]
      );
    } else {
      setAmbienteSelecionado(ambiente);
    }
  };

  const handleExcluirSelecionados = () => {
    if (confirm(`Deseja excluir ${ambientesSelecionados.length} ambiente(s)?`)) {
      const ambientesAtualizados = ambientes.filter(amb => !ambientesSelecionados.includes(amb.id));
      setAmbientes(ambientesAtualizados);
      setAmbientesSelecionados([]);
      setModoSelecao(false);
      
      // Salvar no localStorage
      localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
      
      // Feedback para o usuário
      toast.success(`${ambientesSelecionados.length} ambiente(s) excluído(s) com sucesso!`);
    }
  };
  
  const handleExcluirAmbiente = (ambiente: Ambiente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click seja propagado para o card
    if (confirm(`Deseja excluir o ambiente ${ambiente.nome}?`)) {
      const ambientesAtualizados = ambientes.filter(amb => amb.id !== ambiente.id);
      setAmbientes(ambientesAtualizados);
      
      if (ambienteSelecionado?.id === ambiente.id) {
        setAmbienteSelecionado(null);
      }
      
      // Salvar no localStorage
      localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
      
      // Feedback para o usuário
      toast.success(`Ambiente ${ambiente.nome} excluído com sucesso!`);
    }
  };

  const handleDuplicarSelecionados = () => {
    const ambientesParaDuplicar = ambientes.filter(amb => ambientesSelecionados.includes(amb.id));
    const novosAmbientes = ambientesParaDuplicar.map(amb => ({
      ...amb,
      id: Math.random().toString(),
      nome: `${amb.nome} (Cópia)`,
      ordem: ambientes.length + 1
    }));
    
    const ambientesAtualizados = [...ambientes, ...novosAmbientes];
    setAmbientes(ambientesAtualizados);
    setAmbientesSelecionados([]);
    setModoSelecao(false);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
    
    // Feedback para o usuário
    toast.success(`${novosAmbientes.length} ambiente(s) duplicado(s) com sucesso!`);
  };
  
  const handleDuplicarAmbiente = (ambiente: Ambiente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click seja propagado para o card
    const novoAmbiente = {
      ...ambiente,
      id: Math.random().toString(),
      nome: `${ambiente.nome} (Cópia)`,
      ordem: ambientes.length
    };
    
    const ambientesAtualizados = [...ambientes, novoAmbiente];
    setAmbientes(ambientesAtualizados);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
    
    // Feedback para o usuário
    toast.success(`Ambiente ${ambiente.nome} duplicado com sucesso!`);
  };

  const handleEditarAmbiente = (ambiente: Ambiente) => {
    setAmbienteParaEditar(ambiente);
    setShowNovoAmbiente(true);
    setModoSelecao(false);
  };
  
  const handleEditarAmbienteClick = (ambiente: Ambiente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click seja propagado para o card
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
  
  const sairDoModoSelecao = () => {
    setModoSelecao(false);
    setAmbientesSelecionados([]);
  };

  const selecionarTodosAmbientes = () => {
    setAmbientesSelecionados(ambientes.map(amb => amb.id));
  };

  const limparSelecaoAmbientes = () => {
    setAmbientesSelecionados([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSaveEditedImage = (imagemEditada: string) => {
    if (!ambienteSelecionado) return;
    
    const novasFotos = ambienteSelecionado.fotos.map(foto => 
      foto.url === imagemSelecionada ? { ...foto, url: imagemEditada } : foto
    );

    const ambienteAtualizado = {
      ...ambienteSelecionado,
      fotos: novasFotos
    };

    const ambientesAtualizados = ambientes.map(amb => 
      amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
    );
    
    setAmbientes(ambientesAtualizados);
    setAmbienteSelecionado(ambienteAtualizado);
  };

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
  };

  // Função para atualizar observações e salvar no localStorage
  const handleUpdateObservacoes = (novasObservacoes: string) => {
    if (!ambienteSelecionado) return;
    
    const ambienteAtualizado = {
      ...ambienteSelecionado,
      observacoes: novasObservacoes
    };
    
    const ambientesAtualizados = ambientes.map(amb => 
      amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
    );
    
    setAmbientes(ambientesAtualizados);
    setAmbienteSelecionado(ambienteAtualizado);
    
    // Salvar no localStorage
    localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
  };

  // Mostrar feedback ao salvar observações
  const handleBlurObservacoes = () => {
    if (ambienteSelecionado) {
      toast.success('Observações salvas com sucesso!');
    }
  };

  // Função para lidar com o clique longo em uma imagem
  const handleLongPressImagem = (foto: Foto) => {
    if (!modoSelecaoImagens) {
      setModoSelecaoImagens(true);
      setImagensSelecionadas([foto.id]);
    }
  };

  // Função para lidar com o clique em uma imagem em modo de seleção
  const handleClickImagem = (foto: Foto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique seja propagado e selecione o ambiente
    
    if (modoSelecaoImagens) {
      setImagensSelecionadas(prev => {
        if (prev.includes(foto.id)) {
          // Se a foto já está selecionada, remove da seleção
          const novaSelecao = prev.filter(id => id !== foto.id);
          // Se não houver mais fotos selecionadas, sai do modo de seleção
          if (novaSelecao.length === 0) {
            setModoSelecaoImagens(false);
          }
          return novaSelecao;
        } else {
          // Se a foto não está selecionada, adiciona à seleção
          return [...prev, foto.id];
        }
      });
    } else {
      // Se não estiver em modo de seleção, mostra a imagem expandida
      setImagemSelecionada(foto.url);
    }
  };

  // Função para cancelar a seleção de imagens
  const cancelarSelecaoImagens = () => {
    setModoSelecaoImagens(false);
    setImagensSelecionadas([]);
  };

  // Função para excluir as imagens selecionadas
  const handleExcluirImagensSelecionadas = () => {
    if (!ambienteSelecionado || imagensSelecionadas.length === 0) return;

    if (confirm(`Deseja excluir ${imagensSelecionadas.length} imagem(ns) selecionada(s)?`)) {
      const novasFotos = ambienteSelecionado.fotos.filter(
        foto => !imagensSelecionadas.includes(foto.id)
      );

      const ambienteAtualizado = {
        ...ambienteSelecionado,
        fotos: novasFotos
      };

      const ambientesAtualizados = ambientes.map(amb => 
        amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
      );

      setAmbientes(ambientesAtualizados);
      setAmbienteSelecionado(ambienteAtualizado);
      setModoSelecaoImagens(false);
      setImagensSelecionadas([]);
      
      // Salvar no localStorage
      localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
      
      // Feedback para o usuário
      toast.success(`${imagensSelecionadas.length} imagem(ns) excluída(s) com sucesso!`);
    }
  };

  const handleExcluirFoto = (foto: Foto, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o evento de clique na foto se propague
    
    if (confirm('Deseja excluir esta foto?')) {
      if (!ambienteSelecionado) return;
      
      const ambienteAtualizado = {
        ...ambienteSelecionado,
        fotos: ambienteSelecionado.fotos.filter(f => f.id !== foto.id)
      };
      
      const ambientesAtualizados = ambientes.map(amb => 
        amb.id === ambienteSelecionado.id ? ambienteAtualizado : amb
      );
      
      setAmbientes(ambientesAtualizados);
      setAmbienteSelecionado(ambienteAtualizado);
      
      // Salvar no localStorage
      localStorage.setItem('ambientes', JSON.stringify(ambientesAtualizados));
      
      // Feedback para o usuário
      toast.success('Foto excluída com sucesso!');
    }
  };

  // Função para verificar existência de fotos correspondentes na vistoria de saída
  const existeImagemCorrespondente = (fotoEntradaId: string) => {
    if (!ambienteSelecionado) return false;
    
    return ambienteSelecionado.fotos.some(foto => 
      foto.referenciaEntradaId === fotoEntradaId
    );
  };

  // Função para obter as fotos
  const getFotosPorTab = () => {
    if (!ambienteSelecionado) return [];
    return ambienteSelecionado.fotos;
  };

  // Função para obter as observações
  const getObservacoesPorTab = () => {
    if (!ambienteSelecionado) return '';
    return ambienteSelecionado.observacoes;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Lista de Ambientes (Sidebar Esquerda) */}
      <aside className="w-48 bg-white border-r border-border h-screen fixed left-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {modoSelecao 
                ? "Ambientes" 
                : "Ambientes"
              }
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
      <div className="flex-1 pl-48">
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
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-6">
          {/* Área de Fotos */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Fotos do Ambiente</h2>
              {modoSelecaoImagens ? (
                <div className="flex gap-2">
                  <button 
                    onClick={handleExcluirImagensSelecionadas}
                    className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    disabled={imagensSelecionadas.length === 0}
                  >
                    Excluir {imagensSelecionadas.length > 0 ? `(${imagensSelecionadas.length})` : ''}
                  </button>
                  <button 
                    onClick={cancelarSelecaoImagens}
                    className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                ambienteSelecionado?.fotos && ambienteSelecionado.fotos.length > 0 && (
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

            {!ambienteSelecionado ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Camera className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-center mb-1">Selecione um ambiente para visualizar fotos</p>
                <p className="text-xs text-gray-400 text-center">ou crie um novo ambiente na barra lateral</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        alt={foto.descricao || "Foto do ambiente"}
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
                        onClick={(e) => handleExcluirFoto(foto, e)}
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
                  disabled={!ambienteSelecionado || modoSelecaoImagens}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-sm font-medium">Adicionar foto</span>
                </button>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações do Ambiente</h2>
            
            {!ambienteSelecionado ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <p className="text-center">Selecione um ambiente para adicionar observações</p>
              </div>
            ) : (
              <textarea
                value={ambienteSelecionado?.observacoes || ''}
                onChange={(e) => {
                  if (ambienteSelecionado) {
                    handleUpdateObservacoes(e.target.value);
                  }
                }}
                onBlur={handleBlurObservacoes}
                disabled={!ambienteSelecionado}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={ambienteSelecionado ? "Adicione observações sobre este ambiente..." : "Selecione um ambiente para adicionar observações"}
              />
            )}
          </div>
        </main>
      </div>

      {/* Lista de Itens (Sidebar Direita) */}
      <aside className="w-48 bg-white border-l border-border h-screen sticky top-0 overflow-y-auto">
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
                    onClick={() => ambienteSelecionado && router.push(`/dashboard/itens?itemId=${item.id}&ambienteId=${ambienteSelecionado.id}`)}
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

      {/* Modal de Adicionar/Editar Ambiente */}
      {showNovoAmbiente && (
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
      )}

      {/* Modal de Novo Item */}
      <NovoItemModal
        isOpen={showNovoItem}
        onClose={() => setShowNovoItem(false)}
        onAdd={handleAddItem}
      />

      {/* Modal de Imagem Expandida */}
      {imagemSelecionada && (
        <ImagemExpandidaModal
          isOpen={!!imagemSelecionada}
          onClose={() => setImagemSelecionada(null)}
          imageUrl={imagemSelecionada}
          onSave={handleSaveEditedImage}
        />
      )}

      {/* Toaster para notificações */}
      <Toaster />
    </div>
  );
} 
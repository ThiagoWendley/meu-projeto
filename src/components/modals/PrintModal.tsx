import { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filters: PrintFilters) => void;
}

interface PrintFilters {
  startDate: string;
  endDate: string;
  inspectionType?: string;
  inspectorId?: string;
}

export default function PrintModal({ isOpen, onClose, onConfirm }: PrintModalProps) {
  const [filters, setFilters] = useState<PrintFilters>({
    startDate: '',
    endDate: '',
    inspectionType: '',
    inspectorId: ''
  });

  // Mock data - em produção viria da API
  const inspectionTypes = [
    { id: 'entrada', name: 'Entrada' },
    { id: 'saida', name: 'Saída' },
    { id: 'periodica', name: 'Periódica' }
  ];

  const inspectors = [
    { id: 'company', name: 'Tah visto vistorias' },
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' }
  ];

  const handleSubmit = () => {
    onConfirm(filters);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[9999] max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Gerar Relatório
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Final
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Tipo de Vistoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vistoria
                </label>
                <select
                  value={filters.inspectionType}
                  onChange={(e) => setFilters(prev => ({ ...prev, inspectionType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Todos os tipos</option>
                  {inspectionTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Vistoriador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vistoriador
                </label>
                <select
                  value={filters.inspectorId}
                  onChange={(e) => setFilters(prev => ({ ...prev, inspectorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Todos os vistoriadores</option>
                  {inspectors.map(inspector => (
                    <option key={inspector.id} value={inspector.id}>{inspector.name}</option>
                  ))}
                </select>
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
            >
              <FileText className="w-4 h-4" />
              Gerar Relatório
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 
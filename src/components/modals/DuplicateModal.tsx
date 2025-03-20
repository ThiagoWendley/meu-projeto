import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DuplicateFormData) => void;
  inspectionData: {
    propertyId: string;
    propertyName: string;
    inspectionType: string;
  };
}

interface DuplicateFormData {
  scheduledDate: string;
  scheduledTime: string;
  inspectorId: string;
}

export default function DuplicateModal({ isOpen, onClose, onConfirm, inspectionData }: DuplicateModalProps) {
  const [formData, setFormData] = useState<DuplicateFormData>({
    scheduledDate: '',
    scheduledTime: '',
    inspectorId: ''
  });

  // Mock data - em produção viria da API
  const inspectors = [
    { id: 'company', name: 'Tah visto vistorias' },
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' }
  ];

  const handleSubmit = () => {
    onConfirm(formData);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[9999] max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Duplicar Vistoria
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações da Vistoria Original */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h3 className="text-sm font-medium text-gray-900">
                Informações da Vistoria Original
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Imóvel:</span> {inspectionData.propertyName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tipo de Vistoria:</span> {inspectionData.inspectionType}
                </p>
              </div>
            </div>

            {/* Formulário */}
            <div className="space-y-4">
              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Vistoriador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vistoriador
                </label>
                <select
                  value={formData.inspectorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspectorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Selecione um vistoriador</option>
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
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
            >
              Duplicar Vistoria
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 
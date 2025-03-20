'use client';

import { useState, useRef } from 'react';
import { X, Check, Mail, Smartphone, CreditCard, Eye, EyeOff, FileText, Upload, Building2, User, Plus, ChevronDown, Save, Trash2, Edit2, Download } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

function BaseDialog({ isOpen, onClose, children, title }: DialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-[calc(100%-2rem)] sm:w-full mx-auto z-[9999] ${title === "Escolha seu Plano" ? "max-w-6xl" : "max-w-lg"}`}>
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-white rounded-t-xl">
            <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Diálogo de Notificações
export function NotificationsDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newInspections: true,
    statusUpdates: true,
    reports: true,
    marketing: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Configurar Notificações">
      <div className="space-y-6">
        {/* Canais */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Canais de Notificação</h3>
          <div className="space-y-3">
            <button
              onClick={() => toggleNotification('email')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-gray-600">Notificações por E-mail</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${notifications.email ? 'bg-primary' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.email ? 'right-1' : 'right-5'}`} />
              </div>
            </button>

            <button
              onClick={() => toggleNotification('push')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="text-gray-600">Notificações Push</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${notifications.push ? 'bg-primary' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.push ? 'right-1' : 'right-5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Tipos de Notificação */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Tipos de Notificação</h3>
          <div className="space-y-3">
            <button
              onClick={() => toggleNotification('newInspections')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">Novas Vistorias</span>
              <div className={`w-10 h-6 rounded-full transition-colors ${notifications.newInspections ? 'bg-primary' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.newInspections ? 'right-1' : 'right-5'}`} />
              </div>
            </button>

            <button
              onClick={() => toggleNotification('statusUpdates')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">Atualizações de Status</span>
              <div className={`w-10 h-6 rounded-full transition-colors ${notifications.statusUpdates ? 'bg-primary' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.statusUpdates ? 'right-1' : 'right-5'}`} />
              </div>
            </button>

            <button
              onClick={() => toggleNotification('reports')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">Relatórios e Análises</span>
              <div className={`w-10 h-6 rounded-full transition-colors ${notifications.reports ? 'bg-primary' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.reports ? 'right-1' : 'right-5'}`} />
              </div>
            </button>

            <button
              onClick={() => toggleNotification('marketing')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">Novidades e Marketing</span>
              <div className={`w-10 h-6 rounded-full transition-colors ${notifications.marketing ? 'bg-primary' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.marketing ? 'right-1' : 'right-5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// Diálogo de Senha
export function PasswordDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Alterar Senha">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="current"
                value={passwords.current}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Digite sua senha atual"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="new"
                value={passwords.new}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Digite sua nova senha"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              title="Confirme sua nova senha"
              placeholder="Confirme sua nova senha"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
          >
            Alterar Senha
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// Diálogo de Assinatura Digital
export function SignatureDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [signature, setSignature] = useState({
    type: 'draw', // 'draw' | 'upload' | 'type'
    data: ''
  });

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Gerenciar Assinatura Digital">
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 text-gray-600">
            <FileText className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-medium">Assinatura Digital Ativa</p>
              <p>Válida até 31/12/2024</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSignature({ ...signature, type: 'draw' })}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                signature.type === 'draw'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Desenhar
            </button>
            <button
              onClick={() => setSignature({ ...signature, type: 'upload' })}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                signature.type === 'upload'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Enviar Imagem
            </button>
            <button
              onClick={() => setSignature({ ...signature, type: 'type' })}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                signature.type === 'type'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Digitar
            </button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg h-48 flex items-center justify-center">
            {signature.type === 'draw' && (
              <p className="text-gray-500 text-sm">Área para desenhar a assinatura</p>
            )}
            {signature.type === 'upload' && (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Arraste uma imagem ou</p>
                <button className="text-primary hover:text-primary-light text-sm font-medium">
                  Escolha um arquivo
                </button>
              </div>
            )}
            {signature.type === 'type' && (
              <input
                type="text"
                placeholder="Digite sua assinatura"
                className="w-3/4 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
              />
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
          >
            Salvar Assinatura
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// Diálogo de Tema
export function ThemeDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const primaryColor = '#264450';
  const [selectedColor, setSelectedColor] = useState(primaryColor);
  const [isCustom, setIsCustom] = useState(false);

  const predefinedColors = [
    { name: 'Primária', value: primaryColor },
    { name: 'Roxo', value: '#7C3AED' },
    { name: 'Verde', value: '#059669' },
    { name: 'Vermelho', value: '#DC2626' },
    { name: 'Laranja', value: '#EA580C' },
    { name: 'Rosa', value: '#DB2777' }
  ];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setIsCustom(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
    setIsCustom(true);
  };

  const handleReset = () => {
    setSelectedColor(primaryColor);
    setIsCustom(false);
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Personalizar Tema">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Cores Predefinidas</h3>
            <button
              onClick={handleReset}
              className="text-sm text-primary hover:text-primary-light"
            >
              Restaurar Padrão
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all text-sm
                  ${selectedColor === color.value && !isCustom
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="font-medium text-gray-700">{color.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Cor Personalizada</h3>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={selectedColor}
              onChange={handleCustomColorChange}
              className="w-12 h-12 rounded-lg overflow-hidden"
              title="Selecionar cor personalizada"
            />
            <div className="flex-1">
              <input
                type="text"
                value={selectedColor.toUpperCase()}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Código da cor em hexadecimal"
                placeholder="Digite o código da cor (ex: #000000)"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Pré-visualização</h4>
          <div className="space-y-3">
            <button
              className="w-full px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: selectedColor }}
            >
              Botão Primário
            </button>
            <div
              className="w-full h-2 rounded-full"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm" style={{ color: selectedColor }}>
                Texto Colorido
              </span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-lg"
            style={{ backgroundColor: selectedColor }}
          >
            Aplicar Tema
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// Diálogo de Planos (melhorado)
export function PlansDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'premium'>('pro');

  const plans = [
    {
      id: 'basic',
      name: 'Plano Básico',
      price: 199.90,
      discount: '50% Off',
      features: [
        'Até 50 vistorias por mês',
        'Até 2 vistoriadores',
        'Suporte por email'
      ],
      bgColor: 'bg-gray-50'
    },
    {
      id: 'pro',
      name: 'Plano Pro',
      price: 449.90,
      discount: '20% Off',
      features: [
        'Vistorias ilimitadas',
        'Até 10 vistoriadores',
        'Suporte prioritário'
      ],
      bgColor: 'bg-orange-50'
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      price: 1199.90,
      features: [
        'Vistorias ilimitadas',
        'Vistoriadores ilimitados',
        'Suporte 24/7'
      ],
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Escolha seu Plano">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${plan.bgColor} rounded-xl p-3 md:p-6`}
          >
            <div className="flex flex-col h-full">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <h3 className="text-base md:text-xl font-semibold">{plan.name}</h3>
                    {plan.discount && (
                      <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 md:py-1 rounded">
                        {plan.discount}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 md:mt-2">
                    <span className="text-lg md:text-2xl font-bold">R$ {plan.price.toFixed(2)}</span>
                    <span className="text-gray-600 text-xs md:text-sm ml-1">por usuário/mês faturado anualmente</span>
                  </div>
                </div>

                <ul className="space-y-1.5 md:space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      <span className="text-gray-600 text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 md:mt-auto pt-3 md:pt-4">
                <button
                  onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                  className="w-full bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Selecionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Assinar {plans.find(p => p.id === selectedPlan)?.name}</span>
        </button>
      </div>
    </BaseDialog>
  );
}

// Diálogo de Edição de Perfil
export function ProfileDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [profile, setProfile] = useState({
    // Dados da Empresa
    companyName: 'Evolução Vistoria',
    companyCnpj: '12.345.678/0001-90',
    companyAddress: 'Av. Paulista, 1000',
    companyNumber: '1000',
    companyComplement: '',
    companyNeighborhood: 'Bela Vista',
    companyCity: 'São Paulo',
    companyState: 'SP',
    companyCep: '01310-100',
    companyLogo: '',
    // Dados Pessoais
    name: 'Paulo Morales',
    email: 'paulomorales@gmail.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar máscara para CEP
    if (name === 'companyCep') {
      const cepValue = value.replace(/\D/g, ''); // Remove não dígitos
      const cepMask = cepValue.replace(/(\d{5})(\d{3})/, '$1-$2'); // Aplica máscara 00000-000
      setProfile(prev => ({ ...prev, [name]: cepMask }));

      // Buscar endereço quando CEP estiver completo
      if (cepValue.length === 8) {
        fetchAddress(cepValue);
      }
      return;
    }

    // Aplicar máscara para CPF
    if (name === 'cpf') {
      const cpfValue = value.replace(/\D/g, ''); // Remove não dígitos
      const cpfMask = cpfValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // Aplica máscara 000.000.000-00
      setProfile(prev => ({ ...prev, [name]: cpfMask }));
      return;
    }

    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const fetchAddress = async (cep: string) => {
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (!data.erro) {
        setProfile(prev => ({
          ...prev,
          companyAddress: data.logradouro,
          companyNeighborhood: data.bairro,
          companyCity: data.localidade,
          companyState: data.uf,
          companyComplement: data.complemento
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <div className="space-y-8">
        {/* Dados da Empresa */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-gray-900">Dados da Empresa</h3>
          </div>

          {/* Logo da Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo da Empresa
            </label>
            <div className="flex items-center gap-4">
              {profile.companyLogo ? (
                <div className="relative w-24 h-24">
                  <Image
                    src={profile.companyLogo}
                    alt="Logo da empresa"
                    fill
                    className="rounded-lg object-cover border border-border"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <label 
                htmlFor="logo-input"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Escolher logo
              </label>
              <input
                ref={logoInputRef}
                type="file"
                id="logo-input"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={profile.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="companyCnpj" className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                id="companyCnpj"
                name="companyCnpj"
                value={profile.companyCnpj}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="companyCep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="companyCep"
                  name="companyCep"
                  value={profile.companyCep}
                  onChange={handleChange}
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
                {isLoadingCep && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="companyAddress"
                name="companyAddress"
                value={profile.companyAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  id="companyNumber"
                  name="companyNumber"
                  value={profile.companyNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyComplement" className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  id="companyComplement"
                  name="companyComplement"
                  value={profile.companyComplement}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyNeighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                id="companyNeighborhood"
                name="companyNeighborhood"
                value={profile.companyNeighborhood}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  id="companyCity"
                  name="companyCity"
                  value={profile.companyCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyState" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  id="companyState"
                  name="companyState"
                  value={profile.companyState}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="space-y-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={profile.cpf}
                onChange={handleChange}
                maxLength={14}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3B5A] hover:bg-[#1B3B5A]/90 transition-colors rounded-lg"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

interface TipoVistoria {
  nome: string;
  entendimentoProcesso: string;
  modeloDocumento?: File | null;
  modeloDocumentoNome?: string;
  modeloDocumentoUrl?: string;
}

export function InspectionConfigDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tiposVistoria, setTiposVistoria] = useState<TipoVistoria[]>([
    { 
      nome: 'Entrada', 
      entendimentoProcesso: 'Vistoria realizada no momento em que o inquilino recebe as chaves do imóvel.',
      modeloDocumentoNome: 'modelo-entrada.pdf',
      modeloDocumentoUrl: '/docs/modelo-entrada.pdf'
    },
    { 
      nome: 'Saída', 
      entendimentoProcesso: 'Vistoria realizada no momento em que o inquilino devolve as chaves do imóvel.',
      modeloDocumentoNome: 'modelo-saida.pdf',
      modeloDocumentoUrl: '/docs/modelo-saida.pdf'
    }
  ]);
  const [tiposImovel, setTiposImovel] = useState<string[]>(['Casa', 'Apartamento', 'Sala Comercial']);
  const [novoTipoVistoria, setNovoTipoVistoria] = useState<TipoVistoria>({
    nome: '',
    entendimentoProcesso: '',
    modeloDocumento: null
  });
  const [novoTipoImovel, setNovoTipoImovel] = useState('');
  const [selectedTipoVistoria, setSelectedTipoVistoria] = useState<TipoVistoria | null>(null);
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [isEditingVistoria, setIsEditingVistoria] = useState(false);

  const handleAddTipoVistoria = () => {
    if (novoTipoVistoria.nome && novoTipoVistoria.entendimentoProcesso) {
      setTiposVistoria([...tiposVistoria, novoTipoVistoria]);
      setNovoTipoVistoria({
        nome: '',
        entendimentoProcesso: '',
        modeloDocumento: null
      });
    }
  };

  const handleAddTipoImovel = () => {
    if (novoTipoImovel && !tiposImovel.includes(novoTipoImovel)) {
      setTiposImovel([...tiposImovel, novoTipoImovel]);
      setNovoTipoImovel('');
    }
  };

  const handleRemoveTipoVistoria = (nome: string) => {
    setTiposVistoria(tiposVistoria.filter(tipo => tipo.nome !== nome));
  };

  const handleRemoveTipoImovel = (tipo: string) => {
    setTiposImovel(tiposImovel.filter(t => t !== tipo));
  };

  const handleDocumentoVistoria = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNovoTipoVistoria({
        ...novoTipoVistoria,
        modeloDocumento: file,
        modeloDocumentoNome: file.name
      });
    }
  };

  const handleEditTipoVistoria = (tipo: TipoVistoria) => {
    setSelectedTipoVistoria(tipo);
    setNovoTipoVistoria(tipo);
    setIsEditingVistoria(true);
  };

  const handleUpdateTipoVistoria = () => {
    if (selectedTipoVistoria) {
      setTiposVistoria(tiposVistoria.map(tipo => 
        tipo.nome === selectedTipoVistoria.nome ? novoTipoVistoria : tipo
      ));
      setNovoTipoVistoria({
        nome: '',
        entendimentoProcesso: '',
        modeloDocumento: null
      });
      setSelectedTipoVistoria(null);
      setIsEditingVistoria(false);
    }
  };

  const handleDownloadDocumento = async (tipo: TipoVistoria) => {
    try {
      if (tipo.modeloDocumento instanceof File) {
        const url = URL.createObjectURL(tipo.modeloDocumento);
        const a = document.createElement('a');
        a.href = url;
        a.download = tipo.modeloDocumentoNome || 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (tipo.modeloDocumentoUrl) {
        // Se tivermos uma URL, fazer uma requisição para baixar o documento
        const response = await fetch(tipo.modeloDocumentoUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tipo.modeloDocumentoNome || 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Não foi possível baixar o documento. Tente novamente mais tarde.');
    }
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Configurações de Vistorias">
      <div className="space-y-6">
        {/* Tipos de Vistoria */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Tipos de Vistoria</h3>
          
          {/* Lista de Tipos de Vistoria Existentes */}
          <div className="space-y-4">
            {tiposVistoria.map((tipo) => (
              <div key={tipo.nome} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 min-w-0 mr-4">
                    <h4 className="text-base font-medium text-gray-900">{tipo.nome}</h4>
                    <p className="text-sm text-gray-600 break-words">{tipo.entendimentoProcesso}</p>
                    {(tipo.modeloDocumentoNome || tipo.modeloDocumentoUrl) && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{tipo.modeloDocumentoNome || 'Documento'}</span>
                        <button
                          onClick={() => handleDownloadDocumento(tipo)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                          title="Baixar documento"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditTipoVistoria(tipo)}
                      className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveTipoVistoria(tipo.nome)}
                      className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulário de Novo Tipo de Vistoria */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <h4 className="text-base font-medium text-gray-900">
              {isEditingVistoria ? 'Editar Tipo de Vistoria' : 'Adicionar Novo Tipo de Vistoria'}
            </h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="tipoVistoriaNome" className="block text-sm font-medium text-gray-700">
                  Nome do Tipo de Vistoria
                </label>
                <input
                  type="text"
                  id="tipoVistoriaNome"
                  value={novoTipoVistoria.nome}
                  onChange={(e) => setNovoTipoVistoria({ ...novoTipoVistoria, nome: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                  placeholder="Ex: Vistoria de Entrada"
                />
              </div>

              <div>
                <label htmlFor="entendimentoProcesso" className="block text-sm font-medium text-gray-700">
                  Entendimento do Processo
                </label>
                <textarea
                  id="entendimentoProcesso"
                  value={novoTipoVistoria.entendimentoProcesso}
                  onChange={(e) => setNovoTipoVistoria({ ...novoTipoVistoria, entendimentoProcesso: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                  placeholder="Descreva o processo desta vistoria..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo de Documento
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Escolher arquivo
                    <input
                      type="file"
                      onChange={handleDocumentoVistoria}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  {novoTipoVistoria.modeloDocumentoNome && (
                    <span className="text-sm text-gray-600">
                      {novoTipoVistoria.modeloDocumentoNome}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                {isEditingVistoria && (
                  <button
                    type="button"
                    onClick={() => {
                      setNovoTipoVistoria({
                        nome: '',
                        entendimentoProcesso: '',
                        modeloDocumento: null
                      });
                      setSelectedTipoVistoria(null);
                      setIsEditingVistoria(false);
                    }}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={isEditingVistoria ? handleUpdateTipoVistoria : handleAddTipoVistoria}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                >
                  {isEditingVistoria ? 'Salvar Alterações' : 'Adicionar Tipo de Vistoria'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tipos de Imóvel */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tipos de Imóvel</h3>
          
          <div className="flex flex-wrap gap-2">
            {tiposImovel.map((tipo) => (
              <div
                key={tipo}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                <span>{tipo}</span>
                <button
                  onClick={() => handleRemoveTipoImovel(tipo)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={novoTipoImovel}
              onChange={(e) => setNovoTipoImovel(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              placeholder="Novo tipo de imóvel..."
            />
            <button
              onClick={handleAddTipoImovel}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
} 
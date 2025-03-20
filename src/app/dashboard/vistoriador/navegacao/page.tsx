'use client';

import { useState } from 'react';
import { ArrowLeft, BellRing, Lock, Camera, Calendar, MessageSquare, Share2, Settings, X, Upload, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SidebarVistoriador from '@/components/layout/SidebarVistoriador';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';

export default function NavegacaoPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVistoria, setActiveVistoria] = useState<string>('1');
  const [sidebarTab, setSidebarTab] = useState<'local' | 'enviadas'>('local');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackImage, setFeedbackImage] = useState<string | null>(null);

  const handleVoltar = () => {
    router.push('/dashboard/vistoriador');
  };

  const handleSidebarTabChange = (tab: 'local' | 'enviadas') => {
    setSidebarTab(tab);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFeedbackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendFeedback = () => {
    // Aqui seria a implementação do envio do feedback para o backend
    // Por enquanto, vamos apenas simular o envio e fechar o modal
    console.log('Feedback enviado:', { 
      texto: feedbackText, 
      imagem: feedbackImage ? 'Imagem anexada' : 'Sem imagem' 
    });
    
    // Limpar os estados e fechar o modal
    setFeedbackText('');
    setFeedbackImage(null);
    setFeedbackModalOpen(false);
    
    // Mostrar alguma mensagem de sucesso (em uma implementação real)
    alert('Sugestão enviada com sucesso! Obrigado pelo feedback.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarVistoriador
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeVistoriaId={activeVistoria}
        onVistoriaClick={(id) => setActiveVistoria(id)}
        onSettingsClick={() => {}}
        showSettings={true}
        activeTab={sidebarTab}
        onTabChange={handleSidebarTabChange}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 pl-0 md:pl-64">
        <header className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVoltar}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Card Notificações */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <BellRing className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
                  <p className="text-sm text-gray-600">Gerencie suas preferências de notificação</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" />
                  <span className="text-gray-700">Novas vistorias atribuídas</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" />
                  <span className="text-gray-700">Lembretes de vistoria</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" />
                  <span className="text-gray-700">Atualizações de status</span>
                </label>
              </div>
            </div>

            {/* Card Segurança */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Segurança</h2>
                  <p className="text-sm text-gray-600">Altere sua senha e configure a segurança</p>
                </div>
              </div>
              
              <button className="text-primary hover:text-primary-light transition-colors font-medium">
                Alterar senha
              </button>
            </div>

            {/* Card Câmera */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Câmera</h2>
                  <p className="text-sm text-gray-600">Configure as opções de fotografia</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" />
                  <span className="text-gray-700">Habilitar foto na vertical</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" />
                  <span className="text-gray-700">Data e hora na foto</span>
                </label>
              </div>
            </div>

            {/* Card Feedback */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Feedback</h2>
                  <p className="text-sm text-gray-600">Envie suas opiniões e sugestões</p>
                </div>
              </div>
              
              <button 
                onClick={() => setFeedbackModalOpen(true)}
                className="text-primary hover:text-primary-light transition-colors font-medium"
              >
                Enviar sugestões para os desenvolvedores
              </button>

              {/* Modal de Feedback */}
              <Dialog.Root open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1000]" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[1001] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Enviar sugestão
                      </Dialog.Title>
                      <Dialog.Close className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </Dialog.Close>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                          Sua sugestão
                        </label>
                        <textarea
                          id="feedback"
                          placeholder="Descreva sua sugestão ou feedback aqui..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[120px]"
                        />
                      </div>
                      
                      <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">
                          Anexar imagem (opcional)
                        </p>
                        <div className="space-y-3">
                          {feedbackImage ? (
                            <div className="relative">
                              <Image 
                                src={feedbackImage} 
                                alt="Imagem anexada" 
                                width={300} 
                                height={200} 
                                className="object-contain rounded-lg border border-gray-200"
                              />
                              <button 
                                onClick={() => setFeedbackImage(null)}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 p-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer group">
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                <Upload className="w-5 h-5 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-600">Clique para selecionar uma imagem</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileSelect} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSendFeedback}
                          disabled={!feedbackText.trim()}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            feedbackText.trim() 
                              ? 'bg-primary hover:bg-primary-light text-white' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } transition-colors`}
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar feedback</span>
                        </button>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            {/* Card Redes Sociais */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Redes Sociais</h2>
                  <p className="text-sm text-gray-600">Conecte-se conosco</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Instagram
                </button>
                <button className="py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  LinkedIn
                </button>
                <button className="py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Facebook
                </button>
              </div>
            </div>

            {/* Card Configurações Gerais */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Configurações Gerais</h2>
                  <p className="text-sm text-gray-600">Outras configurações do sistema</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Versão do App</p>
                  <p className="text-sm text-gray-500">2.1.0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Último login</p>
                  <p className="text-sm text-gray-500">15/05/2024 - 14:30</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
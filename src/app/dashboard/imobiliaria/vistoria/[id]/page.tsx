'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Hash, ArrowLeft, Download, FileVideo, Image as ImageIcon } from 'lucide-react';

// Tipo para mídia (foto ou vídeo)
type Media = {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  description: string;
};

// Dados mockados para exemplo
const mockInspectionDetails = {
  id: 7,
  propertyCode: 'APT-456',
  address: 'Rua das Acácias, 234 - Jardim Europa',
  date: '24/03/2024',
  time: '15:00',
  type: 'Entrada',
  status: 'finalizadas',
  isContestacao: true,
  media: [
    {
      id: 1,
      type: 'image',
      url: '/mock/image1.jpg',
      description: 'Sala de estar'
    },
    {
      id: 2,
      type: 'video',
      url: '/mock/video1.mp4',
      thumbnail: '/mock/thumb1.jpg',
      description: 'Tour pela cozinha'
    },
    // Adicione mais itens conforme necessário
  ] as Media[]
};

export default function InspectionDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Função para download de mídia individual
  const handleDownload = (media: Media) => {
    // Implementar lógica de download
    console.log('Download:', media);
  };

  // Função para download de todas as mídias
  const handleDownloadAll = () => {
    // Implementar lógica de download em massa
    console.log('Download all media');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações da Vistoria */}
        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {mockInspectionDetails.propertyCode}
                </h1>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                <p className="text-gray-600">{mockInspectionDetails.address}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">{mockInspectionDetails.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">{mockInspectionDetails.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Tipo:</span>
                <span className="text-gray-600">{mockInspectionDetails.type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Galeria */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Galeria de Mídia</h2>
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar Todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockInspectionDetails.media.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.description}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                    className="p-2 bg-white rounded-full text-gray-900 hover:text-primary transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
                  <p className="text-xs text-white truncate">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Visualização */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative max-w-4xl w-full mx-4">
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                Fechar
              </button>
              
              <div className="bg-white rounded-lg overflow-hidden">
                {selectedMedia.type === 'image' ? (
                  <div className="relative aspect-video">
                    <Image
                      src={selectedMedia.url}
                      alt={selectedMedia.description}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full aspect-video"
                  />
                )}
                
                <div className="p-4">
                  <p className="text-gray-900">{selectedMedia.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
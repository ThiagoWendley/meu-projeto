'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Hash, ArrowLeft, Building2, Ruler, FileText } from 'lucide-react';

// Mock de detalhes do imóvel
const mockPropertyDetails = {
  id: 1,
  code: 'APT-456',
  address: 'Rua das Acácias, 234 - Jardim Europa',
  type: 'Apartamento',
  area: '75m²',
  inspections: [
    {
      id: 1,
      code: 'VST-2024-001',
      date: '24/03/2024',
      type: 'Entrada',
      status: 'Finalizada',
      inspector: 'João Silva',
      hasIssues: false
    },
    {
      id: 2,
      code: 'VST-2024-002',
      date: '20/02/2024',
      type: 'Periódica',
      status: 'Finalizada',
      inspector: 'Maria Santos',
      hasIssues: true
    },
    {
      id: 3,
      code: 'VST-2024-003',
      date: '15/01/2024',
      type: 'Entrada',
      status: 'Finalizada',
      inspector: 'Carlos Oliveira',
      hasIssues: false
    }
  ]
};

export default function PropertyDetails({ params }: { params: { id: string } }) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finalizada':
        return 'bg-green-50 text-green-700';
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700';
      case 'cancelada':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
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
        {/* Informações do Imóvel */}
        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {mockPropertyDetails.code}
                </h1>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                <p className="text-gray-600">{mockPropertyDetails.address}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">{mockPropertyDetails.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">{mockPropertyDetails.area}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Vistorias */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Vistorias</h2>
            <span className="text-sm text-gray-500">
              Total: {mockPropertyDetails.inspections.length} vistorias
            </span>
          </div>

          <div className="space-y-4">
            {mockPropertyDetails.inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/imobiliaria/vistoria/${inspection.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                      {inspection.status}
                    </span>
                    {inspection.hasIssues && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Pendências
                      </span>
                    )}
                  </div>
                  <button className="text-primary hover:text-primary-dark">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Código</span>
                    <p className="text-sm text-gray-900">{inspection.code}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Data</span>
                    <p className="text-sm text-gray-900">{inspection.date}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Tipo</span>
                    <p className="text-sm text-gray-900">{inspection.type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Vistoriador</span>
                    <p className="text-sm text-gray-900">{inspection.inspector}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 
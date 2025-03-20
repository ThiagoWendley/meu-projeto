'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TelaAmbiente from '@/components/screens/TelaAmbiente';

export default function AmbientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [vistoriaId, setVistoriaId] = useState<string | null>(null);
  const [ehVistoriaSaida, setEhVistoriaSaida] = useState(false);
  const [entryInspectionCode, setEntryInspectionCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Verificar se o parâmetro vistoriaId existe na URL
    const vistoriaIdParam = searchParams?.get('vistoriaId');
    
    if (!vistoriaIdParam) {
      // Se não existir, redirecionar para a página principal de vistorias
      router.push('/dashboard/vistoriador/vistoriar');
    } else {
      setVistoriaId(vistoriaIdParam);
      
      // Verificar se é uma vistoria de saída
      try {
        const vistoriaAtivaString = localStorage.getItem('vistoriaAtiva');
        if (vistoriaAtivaString) {
          const vistoriaAtiva = JSON.parse(vistoriaAtivaString);
          if (vistoriaAtiva && vistoriaAtiva.tipoVistoria === 'saida') {
            setEhVistoriaSaida(true);
            if (vistoriaAtiva.entryInspectionCode) {
              setEntryInspectionCode(vistoriaAtiva.entryInspectionCode);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar tipo de vistoria:', error);
      }
      
      setLoading(false);
    }
  }, [router, searchParams]);

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
    <TelaAmbiente />
  );
} 
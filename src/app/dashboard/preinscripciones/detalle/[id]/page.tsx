// app/dashboard/preinscripciones/detalle/[id]/page.tsx
'use client';
import { use } from 'react';
import RevisionLayout from '@/components/preinscripcion/revision/layout';

export default function RevisionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return <RevisionLayout id={id} />;
}
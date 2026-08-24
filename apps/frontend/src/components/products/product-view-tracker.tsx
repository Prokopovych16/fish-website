'use client';

import { useEffect } from 'react';
import { pixel } from '@/lib/pixel';

interface Props {
  id: string;
  name: string;
  price: number;
}

export function ProductViewTracker({ id, name, price }: Props) {
  useEffect(() => {
    pixel.viewContent(name, id, price);
  }, [id, name, price]);
  return null;
}

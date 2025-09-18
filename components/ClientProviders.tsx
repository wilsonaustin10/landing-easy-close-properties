'use client';

import React from 'react';
import { FormProvider } from '../context/FormContext';
import LazyReCaptchaProvider from './LazyReCaptchaProvider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyReCaptchaProvider>
      <FormProvider>
        {children}
      </FormProvider>
    </LazyReCaptchaProvider>
  );
}
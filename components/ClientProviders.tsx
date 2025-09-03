'use client';

import React from 'react';
import { FormProvider } from '../context/FormContext';
import ReCaptchaProvider from './ReCaptchaProvider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReCaptchaProvider>
      <FormProvider>
        {children}
      </FormProvider>
    </ReCaptchaProvider>
  );
}
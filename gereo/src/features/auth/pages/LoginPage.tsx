import React from 'react';
import { LoginInfoPanel } from '../components/LoginInfoPanel';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg flex my-8">
        <LoginInfoPanel />
        <LoginForm />
      </div>
    </div>
  );
}
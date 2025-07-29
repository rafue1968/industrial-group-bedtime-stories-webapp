'use client';
import SignUpForm from '@/components/SignUpForm';

export default function RegisterPage() {
  return (
    <main style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h1>Create Account</h1>
      <SignUpForm />
    </main>
  );
}

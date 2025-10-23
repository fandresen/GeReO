import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const EyeSlashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228"
    />
  </svg>
);

export function LoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const result = await window.auth.login({ username, password });

    if (result.success) {
      login(result.user);
    } else {
      setError(result.message || 'Erreur de connexion.');
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h1>
      <p className="text-gray-600 mb-8">Connectez-vous à votre compte.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="username"
          >
            Nom d'utilisateur
          </label>
          <div className="mt-1">
            <input
              className="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm outline-0 placeholder-gray-400"
              id="username"
              name="username"
              placeholder="admin"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Mot de passe
          </label>
          <div className="mt-1 relative">
            <input
              className="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 outline-0 sm:text-sm placeholder-gray-400"
              id="password"
              name="password"
              placeholder="••••••••"
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
        </div>

        {/* ... Autres champs (Remember me, etc.) ... */}

        <div>
          <button
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            type="submit"
          >
            Se connecter
          </button>
        </div>
      </form>
    </div>
  );
}

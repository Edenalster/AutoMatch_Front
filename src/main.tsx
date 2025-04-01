import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google";


createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="948364008425-pn2ve5ncji81r9m3c1rk679avbhd3o3e.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);
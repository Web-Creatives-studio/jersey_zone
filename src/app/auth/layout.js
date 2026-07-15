import { AuthProvider } from "../contexts/AuthContext"; // 👈 Adjust this path to match your folder structure
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: "Blog Page",
  description: "Blog page for latest sport news",
};

export default function AuthLayout({ children }) {
  return (
    <>
      <AuthProvider>
        <main className="min-h-screen bg-[#0b0f17]">
          {children}
        </main>
      </AuthProvider>

      <ToastContainer 
        position="bottom-right" 
        theme="dark" 
        autoClose={3000}
      />
    </>
  );
}
import ".././globals.css";
import Footer from "../components/frontend/Footer";
import Header from "../components/frontend/Header"
import { ToastContainer } from "react-toastify";
import UserChat from "../components/frontend/UserChat";

export const metadata = {
  title: "Home Page",
  description: "Jersey Zone Home Page",
};

export default function HomeLayout({ children }) {
  return (
     <>
  

      <main>
            <Header />
        {children}
           <Footer />

      <ToastContainer position="bottom-right" />
      </main>

   
          <UserChat />
    </>
  );
}

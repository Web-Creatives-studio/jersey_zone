import ".././globals.css";
import Footer from "../components/frontend/Footer";
import Header from "../components/frontend/Header"
import { ToastContainer } from "react-toastify";
import UserChat from "../components/frontend/UserChat";

export const metadata = {
  title: "Blog Page",
  description: "Blog page for latest sport news",
};

export default function BlogLayout({ children }) {
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

import "../globals.css";
import AdminWrap from "../components/admin/AdminWrap";
import { ToastContainer } from "react-toastify";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminWrap>{children}</AdminWrap>

      <ToastContainer position="bottom-right" />
    </>
  );
}

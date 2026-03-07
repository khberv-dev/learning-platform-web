
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SvgSprite from "../components/SvgSprite";
import ModalHub from "../components/Modal";

export default function AppLayout() {
  return (
    <>
      <SvgSprite />
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar />
          <Outlet />
        </div>
      </div>

      <ModalHub />
    </>
  );
}
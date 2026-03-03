
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RoleBar from "./RoleBar";
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
          <RoleBar />
          <Topbar />
          <Outlet />
        </div>
      </div>

      <ModalHub />
    </>
  );
}
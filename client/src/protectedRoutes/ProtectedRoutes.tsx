
import { useStore } from "../store/zustand"
import { Navigate, Outlet } from "react-router-dom"


export const ProtectedRoutes = () => {
    const isAuthenticated = useStore((state) => state.isAuthenticated)
  
    return isAuthenticated() ? <Outlet/> : <Navigate to="/signin" replace/>
  }
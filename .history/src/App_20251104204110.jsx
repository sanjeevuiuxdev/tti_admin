import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Blogs from "./pages/Blogs";
import BlogCreate from "./pages/BlogCreate";
import BlogEdit from "./pages/BlogEdit";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories/></ProtectedRoute>} />
          <Route path="/blogs" element={<ProtectedRoute><Blogs/></ProtectedRoute>} />
          <Route path="/blogs/create" element={<ProtectedRoute><BlogCreate/></ProtectedRoute>} />
          <Route path="/blogs/:id/edit" element={<ProtectedRoute><BlogEdit/></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

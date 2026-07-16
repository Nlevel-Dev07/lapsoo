import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import Home from "@/pages/Home"
import Lapandtop from "@/pages/Lapandtop"
import Laptopbazaar from "@/pages/Laptopbazaar"
import ProductDetail from "@/pages/ProductDetail"
import Laptech from "@/pages/Laptech"
import Corporate from "@/pages/Corporate"
import About from "@/pages/About"
import Contact from "@/pages/Contact"
import Blog from "@/pages/Blog"
import BlogPost from "@/pages/BlogPost"
import SellExchange from "@/pages/SellExchange"
import NotFound from "@/pages/NotFound"

import { ProtectedRoute } from "@/admin/ProtectedRoute"
import { AdminLayout } from "@/admin/AdminLayout"
import AdminLogin from "@/admin/pages/Login"
import AdminDashboard from "@/admin/pages/Dashboard"
import AdminProducts from "@/admin/pages/Products"
import AdminProductForm from "@/admin/pages/ProductForm"
import AdminProductsBulkImport from "@/admin/pages/ProductsBulkImport"
import AdminBlog from "@/admin/pages/Blog"
import AdminBlogForm from "@/admin/pages/BlogForm"
import AdminLeads from "@/admin/pages/Leads"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lapandtop" element={<Lapandtop />} />
          <Route path="/laptopbazaar" element={<Laptopbazaar />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/laptech" element={<Laptech />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/sell-exchange" element={<SellExchange />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/bulk-import" element={<AdminProductsBulkImport />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/blog/new" element={<AdminBlogForm />} />
            <Route path="/admin/blog/:id/edit" element={<AdminBlogForm />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

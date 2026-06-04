import { BrowserRouter, Routes, Route } from "react-router-dom";
import LookupPage from "./pages/LookupPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LookupPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

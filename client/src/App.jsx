import { BrowserRouter, Routes, Route } from "react-router-dom";
import LookupPage from "./pages/LookupPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import UtangPage from "./pages/UtangPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LookupPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/utang" element={<UtangPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

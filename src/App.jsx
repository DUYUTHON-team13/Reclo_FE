import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Closet from "./pages/closet";
import ClothesInfo from "./pages/clothesInfo";
import AddClothes from "./pages/addClothes";
import AddInfo from "./pages/addInfo";
import AddClothesNext from "./pages/addClothesNext";
import Change from "./pages/change";
import Delete from "./pages/delete";
import TodayUpload from "./pages/todayUpload";
import Report from "./pages/report";
import Start from "./pages/start";
import Styling from "./pages/styling";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/closet" element={<Closet />} />
        <Route path="/clothes-info" element={<ClothesInfo />} />
        <Route path="/add-clothes" element={<AddClothes />} />
        <Route path="/add-clothes/next" element={<AddClothesNext />} />
        <Route path="/add-clothes/info" element={<AddInfo />} />
        <Route path="/change" element={<Change />} />
        <Route path="/delete" element={<Delete />} />
        <Route path="/today-upload" element={<TodayUpload />} />
        <Route path="/report" element={<Report />} />
        <Route path="/styling" element={<Styling />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

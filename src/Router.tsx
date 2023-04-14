import { BrowserRouter,Route,Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Room } from "./pages/Room"

export const Router:React.FC= () => {
    return<BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/room/:id" element={<Room/>} />
        </Routes>
    </BrowserRouter>
}
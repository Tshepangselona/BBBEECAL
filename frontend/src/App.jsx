import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider, Route,
  Link
} from "react-router-dom";
import SignUp from "./Components/Forms/SignUp";
import Login from "./Components/Forms/Login";
import Home from "./Components/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route index='/SignUp' element={<SignUp />} />
    <Route path='/SignUp' element={<SignUp />} />
    <Route path='/Login' element={<Login />} />
    <Route path='/Home' element={<Home />} />
    </>
  )
)

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
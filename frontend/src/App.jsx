import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider, Route
} from "react-router-dom";
import Signup from "./Components/Forms/SignUp";
import Login from "./Components/Forms/Login";
import Home from "./Components/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="/" element={<h1>Welcome! Go to /signup or /login</h1>} />
    <Route index='/Signup' element={<Signup />} />
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
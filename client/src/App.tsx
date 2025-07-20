import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import Password from './pages/Password'
import Home from './pages/Home'
import Document from './pages/Document'

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/signin' element={<Signin/>}></Route>
      <Route path='/verifyemail' element={<Verify/>}></Route>
      <Route path='/verifyemail/:verificationToken' element={<Verify/>}></Route>
      <Route path='/forgotpassword' element={<Password/>}></Route>
      <Route path='/forgotpassword/:resetpasswordToken' element={<Password/>}></Route>
      <Route path='/resetpassword/:resetpasswordToken' element={<Password/>}></Route>

      <Route path='/document/:documentId' element={<Document/>}></Route>

      <Route path='/' element={<Home/>} ></Route>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

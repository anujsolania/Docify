import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Signin from './components/Signin'
import Signup from './components/Signup'
import Verify from './components/Verify'
import Password from './components/Password'

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
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

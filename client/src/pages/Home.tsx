
import Body from "../components/Body"
import Navbar from "../components/Navbar"


const Home = () => {


  return (
    <div className="bg-gray-300 min-h-screen w-screen flex flex-col" >
      <Navbar/>
      <div className="grow" >
      <Body></Body>
      </div>
      <div className="bg-[#50A2FF] font-serif text-center p-2" >
        © 2025 Docify. All rights Reserved
      </div>
    </div>
  )
}

export default Home

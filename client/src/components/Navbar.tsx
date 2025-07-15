import image from "../assets/logo.png"

const Navbar = () => {
  return (
    <div className="w-screen h-[50px] bg-white flex items-center justify-between p-10">
        <div className="flex gap-4" >
            <img src={image} className="h-10 w-8 m-auto" ></img>
            <h1 className="text-2xl font-semibold m-auto" >Docify </h1>
        </div>
        <div className="flex justify-end gap-10">
            <input className="bg-gray-300 rounded-lg p-5 h-8 w-52" placeholder="Search documents..." ></input>
            <button className="bg-blue-400 h-10 w-10 rounded-full text-white text-2xl" >A</button>
        </div>
    </div>
  )
}

export default Navbar

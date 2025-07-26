import { useState } from "react"
import AuthService from "../services/user-service"
import { useStore } from "../store/zustand"

type showShareProps =  {
    numericdocumentId: number
} 

const ShowShare = ({numericdocumentId}: showShareProps) => {
    const[email,setEmail] = useState("")
    const[permission,setPermission] = useState("")

    const showShare = useStore((state) => state.showShare)
    const setshowShare = useStore((state) => state.setshowShare)

    const token = sessionStorage.getItem("token") as string

const sharedocument = async () => {
  try {
    const response = await AuthService.sharedocument(token,numericdocumentId,email,permission)
    alert(response.data.message)
    setshowShare(false)
  } catch (error: any) {
    console.error(error)
    alert(error.response.data.error)
  }
}

  return (
              <div className="fixed inset-0 flex items-center justify-center  bg-gray-700/50 z-10">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col min-h-[400px] w-[70%] sm:w-[50%] lg:w-[40%] gap-6">
                 <p className="text-lg font-semibold" >Share Document</p>
                 <div>
                  <p className="" >Email:</p>
                  <input className="border border-gray-300 rounded w-full p-1" value={email} onChange={(e) => setEmail(e.target.value)} ></input>
                 </div>
                 <div>
                  <p>Collaborators:</p>
                  <button className="bg-gray-100 h-[30px] rounded w-full p-1 shadow" ></button>
                 </div>
                 <div>
                  <p>Permission:</p>
                  <select className="w-full p-1 border border-gray-300 rounded" 
                  value={permission} onChange={(e) => setPermission(e.target.value)}>
                    <option value="" >Select permission</option>
                    <option value="VIEW" >VIEW</option>
                    <option value="EDIT">EDIT</option>
                  </select>
                  <div className="flex justify-end gap-2 mt-5" >
                    <button className="p-2 rounded border border-gray-300" onClick={() => setshowShare(false)} >Cancel</button>
                    <button className="bg-sky-600 p-2 rounded text-white"
                    onClick={sharedocument} >Share</button>
                  </div>
                 </div>
                </div>
              </div>
  )
}

export default ShowShare

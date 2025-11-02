import { useEffect, useState, useRef } from "react"
import AuthService from "../services/user-service"
import { useStore } from "../store/zustand"
import { useNavigate } from "react-router-dom"
import DocumentCard from "./DocumentCard"

const Body = () => {
  const navigate = useNavigate()
  const [filterOption, setFilterOption] = useState<string>("Owned by me")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // const setContent = useStore((state) => state.setContent)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const createdocument = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return alert("User is not authenticated");
      const response = await AuthService.createdocument(token)
      alert(response.data.message)
      // setContent("")
      navigate(`/document/${response.data.document.id}`)
    } catch (error: any) {
      console.error(error)
      alert(error.response.data.error)
    }
  }

  const handleFilterChange = (option: string) => {
    setFilterOption(option)
    setIsDropdownOpen(false)
  }


  return (
        <div className="flex flex-col gap-6 px-10 md:px-20 lg:px-32 xl:px-40 py-10" >
        <div className="h-[200px] w-full" >
          <button className="h-full w-[150px] bg-white shadow-2xl text-sm flex flex-col justify-center items-center"
          onClick={createdocument} >
            <p className="text-9xl font-extralight text-blue-500">+</p>
            <p className="" >Blank</p>
          </button>
        </div>
        <div className="flex items-center gap-8" >
          <p className="text-lg font-semibold" >Recent Documents</p>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-gray-700">{filterOption}</span>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleFilterChange("Owned by anyone")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span>Owned by anyone</span>
                    {filterOption === "Owned by anyone" && (
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterChange("Owned by me")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span>Owned by me</span>
                    {filterOption === "Owned by me" && (
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterChange("Not owned by me")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span>Not owned by me</span>
                    {filterOption === "Not owned by me" && (
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <DocumentCard ></DocumentCard>
      </div>
  )
}

export default Body

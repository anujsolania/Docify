

function Signup() {
  return (
    <div className="bg-gray-300 min-h-screen flex justify-center items-center" >
        <div className="bg-white rounded-lg h-1/2 w-5/6 shadow-2xl p-6 sm:w-2/3 md:w-1/2 lg:w-1/3" >
        <div className="m-5" >
            <div className="text-4xl font-extrabold flex justify-center" >Get Started</div>
            <div className="text-sky-600 font-medium mt-1 flex justify-center" >Already have an account? <span className="underline" >SignIn</span></div>
        </div>
        <div className="flex justify-center " >
            <div className="flex flex-col w-[90%] gap-5">
                <div className="flex flex-col gap-1" >
                    <div>Name</div>
                    <input type="text" placeholder="John Doe" className="border border-slate-300 rounded-lg w-full p-2 bg-slate-50"></input>
                </div>
               <div className="flex flex-col gap-1" >
                    <div>Email</div>
                    <input type="text" placeholder="abc@gmail.com" className="border border-slate-300 rounded-lg w-full p-2 bg-slate-50"></input>
                </div>
                <div className="flex flex-col gap-1" >
                    <div>Password</div>
                    <input type="password" placeholder="*******" className="border border-slate-300 rounded-lg w-full p-2 bg-slate-50"></input>
                </div>
                <div className="mt-1 mb-8">
                    <button className="w-full bg-sky-600 rounded-lg p-2.5 text-white">Sign Up</button>
                </div>
            </div>
        </div>
        <div>

        </div>
        </div>
    </div>
  )
}

export default Signup

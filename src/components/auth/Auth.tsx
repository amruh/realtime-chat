import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function Auth() {
  const [auth, setAuth] = useState(true);

  return (
    <div className="flex justify-between w-full">
      {
        auth ? 
        <Login setAuth={setAuth}  /> : <Register setAuth={setAuth} />
      }
      <div className="flex flex-col justify-center items-center h-[600px] flex-[3]">
        <img src="https://images.pexels.com/photos/16848795/pexels-photo-16848795/free-photo-of-relaxation-in-luxembourg-garden.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" className="object-cover h-full" />
      </div>
    </div>
  )
}

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function App() {

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quiz_id: "",
    admission_number: "",
    pin: "",
  });

  const handleClick = async (e) => {
    if (!formData.quiz_id || !formData.admission_number || !formData.pin) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://abes-quiz-backend.vercel.app/api/v1/fetch", {
        quiz_uc: formData.quiz_id,
        user_unique_code: formData.admission_number,
        pin: formData.pin
      })
      console.log("Response Data:", response.data);
      if(response.data.success){
        toast.success(response.data.msg ,{
          autoClose:5000
        })
      }else{
        toast.error(response.data.msg)
      }
    }
    catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(`${error.response?.data?.error?.msg || "Something went wrong"}`);
    }
    finally {
      setLoading(false);
    }
  }
  const handleChange = async (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen" >
      <div className="fixed top-0 w-full h-[300px] bg-[#66E1D7]">
      </div>

      <div className="absolute py-4 flex flex-col gap-6 w-[400px] bg-white px-6 shadow-2xl top-[20%] left-[38%] rounded-md   ">
        <h3 className="text-gray-700 font-semibold text-lg text-center">Enter Your Details</h3>
        <div className="flex flex-col ">
          <label className="text-gray-700 font-semibold text-md">Enter Quiz Code:</label>
          <input onChange={handleChange} className="w-full px-2 py-1 focus:outline-none border-b border-black" type="text" name="quiz_id" value={formData.quiz_id} placeholder="Quiz Code" />
        </div>
        <div className="flex flex-col ">
          <label className="text-gray-700 font-semibold text-md">Enter Admission Number</label>
          <input onChange={handleChange} className="w-full px-2 py-1 focus:outline-none border-b border-black" type="text" name="admission_number" value={formData.admission_number} placeholder="Admission Number" />
        </div>
        <div className="flex flex-col ">
          <label className="text-gray-700 font-semibold text-md">Enter 4 Digit Pin:</label>
          <input onChange={handleChange} className="w-full px-2 py-1 focus:outline-none border-b border-black" type="text" name="pin" value={formData.pin} placeholder="4-Digit pin" />
        </div>

        <div className="text-white flex justify-center items-center">
          <input onClick={(e) => handleClick(e)} className="bg-[#4FDDD1] cursor-pointer py-3 rounded-md w-full"  type="submit"value={loading ? 'wait for 5 seconds...' : 'Submit'}disabled={loading} />
        </div>

      </div>

      <div className="relative top-130 z-10 px-5">
        <h3 className="text-lg text-gray-500 font-semibold">Steps:</h3>
        <ul className="flex flex-col gap-2 text-md ">
          <li> 1️⃣ Enter your details (Quiz Code, Admission Number, pin) in the input fields.</li>
          <li> 2️⃣ Click "Submit" and Wait for a few seconds</li>
          <li> 3️⃣ Go to <a className="underline text-blue-500" href="https://abesquiz.netlify.app" target="_blank" rel="noopener noreferrer"> abesquiz.netlify.app</a> and manually click "Submit" to proceed.</li>
          <li> 4️⃣ Done! Your quiz answers will be processed. 🎉</li>
        </ul>
      </div>
    </div>
  )
}

export default App

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function App() {

  const [loading, setLoading] = useState(false);
  const [time,setTime]=useState(10);
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


    localStorage.setItem("admission_number", formData.admission_number);
    localStorage.setItem("pin", formData.pin);
    setLoading(true);
    setTime(10);

    try {
      const response = await axios.post("https://abes-quiz-backend.vercel.app/api/v1/fetch", {
        quiz_uc: formData.quiz_id,
        user_unique_code: formData.admission_number,
        pin: formData.pin
      })

      if (response.data.success) {
        toast.success(response.data.msg, {
          autoClose: 8000,
        })

        setFormData({
          quiz_id: "",
          admission_number: "",
          pin: "",
        });

      } else {
        toast.error(response.data.msg)
      }
    }
    catch (error) {
      if (error.response?.data?.error?.msg) {
        toast.error(error.response?.data?.error?.msg);
        return;
      } else {
      toast.error(
        "Too many vibes at once 😅 Just wait 60 seconds — your timer starts now. Try again when this toast disappears! ",
        {
          position: "top-left",
          autoClose: 60000, // 60 seconds
          pauseOnFocusLoss: false,
          pauseOnHover: false,
          style: { width: '70vw' }
        }
      );
    }
    }

    finally {
      setLoading(false);
    }
  }

  const handleChange = async (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  // 👈 stays for 8 seconds
  useEffect(() => {
    const storedAdmission = localStorage.getItem("admission_number");
    const storedPin = localStorage.getItem("pin");

    if (storedAdmission && storedPin) {
      setFormData((prev) => ({
        ...prev,
        admission_number: storedAdmission,
        pin: storedPin
      }));
    }
  }, []);



  useEffect(() => {
    if (loading && time > 0) {
      const intervalId = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [loading]);

  return (
    <div className="min-h-screen relative" >
      <div className="fixed top-0 w-full h-[300px] bg-[#66E1D7]">
      </div>
      <div className="absolute py-4 flex flex-col gap-6  overflow-y-auto w-[90%] max-w-[400px]  bg-white px-4   shadow-2xl rounded-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40   ">
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

        <div className="text-white flex justify-center items-center ">
          <input  onClick={(e) => handleClick(e)} className={`bg-[#4FDDD1] cursor-pointer py-3 rounded-md w-full`} type="submit" value={loading ? `Wait for ${time} seconds...` : 'Submit'} disabled={loading} />
        </div>

      </div>
      <div className="absolute top-3/4  px-5 py-10  w-full ">
        <h3 className="text-lg text-gray-500 font-semibold">Steps:</h3>
        <ul className="flex flex-col gap-2 text-md w-full">
          <li className="font-semibold">*First Step Bharosa krna hai🎉</li>
          <li> 1️⃣ Enter your details (Quiz Code, Admission Number, pin) in the input fields.</li>
          <li> 2️⃣ Click "Submit" and Wait for a few seconds</li>
          <li> 3️⃣ Go to <a className="underline text-blue-500" href="https://abesquiz.netlify.app" target="_blank" rel="noopener noreferrer"> abesquiz.netlify.app</a> Refresh and manually click "Submit" to proceed.</li>
          <li> 4️⃣ Done! Your quiz answers will be processed. 🎉</li>
        </ul>
      </div>
    </div>
  )
}

export default App

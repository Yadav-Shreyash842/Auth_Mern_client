import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import {AppContext} from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
 
const ResetPassword = () => {

  const {backendUrl} = useContext(AppContext)

  axios.defaults.withCredentials = true;
   
  const navigate = useNavigate()

  const [email , setEmail] = useState('')
  const [newPassword , setNewPassword] = useState('')
  const [isEmailSent , setIsEmailSent] = useState(false)
  const [otp , setOtp] = useState('')
  const [isOtpSubmited , setIsOtpSubmited] = useState(false)

  const inputRefs = React.useRef([])

  const handleInput = (e , index) => {

    if(e.target.value.length > 0 && index < inputRefs.current.length -1 ){

      inputRefs.current[index + 1].focus()

    }

  }

  const handleKeyDown = (e , index) => {

    if(e.key === 'Backspace' && e.target.value.length === 0 && index > 0){

      inputRefs.current[index - 1].focus()

    }

  }

  const handlePaste = (e) => {

    e.preventDefault()

    const pastedData = e.clipboardData.getData('text')

    const otpDigits = pastedData.split('').filter(char => /^\d$/.test(char)).slice(0, 6)

    otpDigits.forEach((digit, index) => {

      if(inputRefs.current[index]){

        inputRefs.current[index].value = digit

      }

    })

    const focusIndex = Math.min(otpDigits.length - 1, 5)

    if(inputRefs.current[focusIndex]){

      inputRefs.current[focusIndex].focus()

    }

  }

  const onSumbitEmail = async (e) => {

    e.preventDefault()

    try {
      
      console.log('🔑 [RESET] Sending reset OTP to:', email);

      const {data} = await axios.post(

        backendUrl + '/api/auth/send-reset-otp',

        {email}

      )
      
      console.log('📨 [RESET] Response:', data);

      if(data.success){

        toast.success(data.message)

        setIsEmailSent(true)

      }else{

        toast.error(data.message)

      }

    } catch (error) {
      
      console.error('❌ [RESET] Error sending OTP:', error);
      console.error('Error details:', error.response?.data);

      toast.error(error.response?.data?.message || error.message)

    }

  }

  const onSumbitOtp = async (e) => {

    e.preventDefault()

    const otpArray = inputRefs.current.map (e => e.value)

    const finalOtp = otpArray.join('')
    
    console.log('🔢 [RESET] OTP entered:', finalOtp);

    // Set OTP state immediately before advancing
    setOtp(finalOtp)
    
    // Small delay to ensure state updates
    setTimeout(() => {
      setIsOtpSubmited(true)
    }, 50)

  }

  const onSubmitNewPassword = async (e) => {

    e.preventDefault()
    
    // Get OTP directly from inputs to avoid state timing issues
    const otpArray = inputRefs.current.map (e => e.value)
    const currentOtp = otpArray.join('')

    try {
      
      console.log('🔐 [RESET] Resetting password for:', email);
      console.log('🔢 [RESET] Using OTP:', currentOtp);

      const {data} = await axios.post(

        backendUrl + '/api/auth/reset-password',

        {email , otp: currentOtp , newPassword}

      )
      
      console.log('📨 [RESET] Response:', data);

      if(data.success){

        toast.success(data.message)

        navigate('/login')

      }else{

        toast.error(data.message)

      }

    } catch (error) {
      
      console.error('❌ [RESET] Error resetting password:', error);
      console.error('Error details:', error.response?.data);

      toast.error(error.response?.data?.message || error.message)

    }

  }

  return (

    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400'>

      <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer' />

      {!isEmailSent &&  

        <form onSubmit={onSumbitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>

          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>

          <p className='text-center text-sm mb-6 text-indigo-300'>Enter your registered email address</p>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>

            <img src={assets.mail_icon} alt="" className='w-3 h-3' />

            <input type="email" placeholder='Email id' className='bg-transparent outline-none text-white'
            value={email} onChange={e => setEmail (e.target.value)} required />

          </div>

          <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>

        </form>

      }

      {!isOtpSubmited && isEmailSent &&  

        <form onSubmit={onSumbitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>

          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>

          <p className='text-center text-sm mb-6 text-indigo-300'>Enter the 6-digit code sent to your email</p>

          <div className='flex justify-between mb-8'>

            {Array(6).fill(0).map((_, index)=> (

              <input type="text" maxLength='1' key={index} required ref={e => inputRefs.current[index] = e}

              onInput={(e) => handleInput(e, index)}

              onKeyDown={(e) => handleKeyDown(e, index)}

              onPaste={handlePaste}

              className='w-12 h-12 bg-[#333a5c] text-center text-white text-xl rounded-md' />

            ))}

          </div>

          <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Submit</button>

        </form>

      }

      {isOtpSubmited && isEmailSent && 

        <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>

          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>

          <p className='text-center text-sm mb-6 text-indigo-300'>Enter your new password</p>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>

            <img src={assets.lock_icon} alt="" className='w-3 h-3' />

            <input type="password" placeholder='password' className='bg-transparent outline-none text-white'
            value={newPassword} onChange={e => setNewPassword (e.target.value)} required />

          </div>

          <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>

        </form>

      }

    </div>

  )
}

export default ResetPassword
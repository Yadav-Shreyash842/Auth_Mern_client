import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const EmailVerify = () => {

    const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext)
    const navigate = useNavigate()
    const inputRefs = React.useRef([])
    const [isResending, setIsResending] = React.useState(false)

    useEffect(() => {
        if (isLoggedin && userData && userData.isAccountVerified) {
            navigate('/')
        }
    }, [isLoggedin, userData])

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
            inputRefs.current[index - 1].focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const digits = e.clipboardData.getData('text').split('').filter(c => /^\d$/.test(c)).slice(0, 6)
        digits.forEach((digit, i) => {
            if (inputRefs.current[i]) inputRefs.current[i].value = digit
        })
        const focusIndex = Math.min(digits.length - 1, 5)
        if (inputRefs.current[focusIndex]) inputRefs.current[focusIndex].focus()
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            const otp = inputRefs.current.map(el => el.value).join('')
            const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp })
            if (data.success) {
                toast.success(data.message)
                getUserData()
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
            } else {
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    const resendOtp = async () => {
        try {
            setIsResending(true)
            const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
            } else {
                toast.error(error.response?.data?.message || error.message)
            }
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer' />
            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
                <p className='text-center text-sm mb-6 text-indigo-300'>Enter the OTP sent to your email address to verify your account.</p>
                <div className='flex justify-between mb-8'>
                    {Array(6).fill(0).map((_, index) => (
                        <input type="text" maxLength='1' key={index} required
                            ref={e => inputRefs.current[index] = e}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            className='w-12 h-12 bg-[#333a5c] text-center text-white text-xl rounded-md'
                        />
                    ))}
                </div>
                <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>
                    Verify Email
                </button>
                <button type="button" onClick={resendOtp} disabled={isResending}
                    className='w-full mt-3 py-2 text-indigo-300 hover:text-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isResending ? 'Resending...' : 'Resend OTP'}
                </button>
            </form>
        </div>
    )
}

export default EmailVerify

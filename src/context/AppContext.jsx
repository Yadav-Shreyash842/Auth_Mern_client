import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;
    

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin , setIsLoggedin] = useState(false);
    const [userData , setUserData] = useState(false)

    // Log backend URL for debugging
    console.log('Backend URL:', backendUrl);

    axios.defaults.withCredentials = true;
    
    // Add axios interceptor to handle 401 errors gracefully
    axios.interceptors.response.use(
        response => response,
        error => {
            // Silently handle 401 errors (user not logged in is expected)
            if (error.response?.status === 401) {
                // Don't log 401 errors - they're expected when not logged in
                return Promise.reject(error);
            }
            return Promise.reject(error);
        }
    );

    const getAuthState = async()=> {
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedin(true)
                getUserData()
            }
            
        } catch (error) {
            // 401 is expected when user is not logged in - don't show error
            if (error.response?.status === 401) {
                setIsLoggedin(false);
                setUserData(false);
            } else {
                console.error('Auth check error:', error);
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    const getUserData = async ()=> {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data')
            if(data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error){
            // 401 is expected when user is not logged in - don't show error
            if (error.response?.status !== 401) {
                console.error('Get user data error:', error);
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

   useEffect (() => {
     getAuthState();
   },[])
    
  
     const value = {
         backendUrl,
         isLoggedin, setIsLoggedin,
         userData,  setUserData,
         getUserData,
     }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
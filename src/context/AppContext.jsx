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

    const getAuthState = async()=> {
        try {
            console.log('Checking auth state...');
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                console.log('User is authenticated');
                setIsLoggedin(true)
                getUserData()
            }
            
        } catch (error) {
            console.log('Auth check failed:', error.response?.status);
            // Don't show error for 401 (user not logged in) - this is expected
            if (error.response?.status !== 401) {
                console.error('Auth check error:', error);
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    const getUserData = async ()=> {
        try {
            console.log('Fetching user data...');
            const {data} = await axios.get(backendUrl + '/api/user/data')
            if(data.success) {
                console.log('User data received:', data.userData);
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error){
            console.log('Get user data failed:', error.response?.status);
            // Don't show error for 401 (user not logged in) - this is expected
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
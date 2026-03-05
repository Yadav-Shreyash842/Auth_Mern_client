import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [isLoggedin , setIsLoggedin] = useState(false);
    const [userData , setUserData] = useState(false)
    
    console.log('🔗 Backend URL:', backendUrl);

    const getAuthState = async()=> {

        try {

            const {data} = await axios.get(
                backendUrl + '/api/auth/is-auth'
            )

            if(data.success){
                console.log('✅ User is authenticated');
                setIsLoggedin(true)

                getUserData()

            }

        } catch (error) {

            if (error.response?.status !== 401) {
                console.error('❌ Auth check error:', error.response?.data || error.message);
                toast.error(error.response?.data?.message || error.message)

            } else {
                console.log('ℹ️ User not authenticated (expected)');
            }

        }

    }

    const getUserData = async ()=> {

        try {

            const {data} = await axios.get(
                backendUrl + '/api/user/data'
            )

            if(data.success){
                console.log('✅ User data received:', data.userData.name);
                setUserData(data.userData)

            }else{

                toast.error(data.message)

            }

        } catch (error){

            if (error.response?.status !== 401) {
                console.error('❌ Get user data error:', error.response?.data || error.message);
                toast.error(error.response?.data?.message || error.message)

            }

        }

    }

   useEffect (() => {

     getAuthState();

   },[])

     const value = {

         backendUrl,
         isLoggedin,
         setIsLoggedin,
         userData,
         setUserData,
         getUserData,

     }

    return (

        <AppContext.Provider value={value}>

            {props.children}

        </AppContext.Provider>

    )
}
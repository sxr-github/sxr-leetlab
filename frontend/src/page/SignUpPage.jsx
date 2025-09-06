import React , {useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from "@hookform/resolvers/zod"
import {link} from "react-router-dom"
import {z} from "zod"
import {
  Code,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

const SignUpSchema = z.object({
  email : z.string().email("Enter a valid email"),
  password : z.string().min(6 , "password must be atleast 6 character"),
  name : z.string().min(3 , "Name must be atleast 3 characters ")
})

const SignUpPage = () => {

  const [showPassword , setShowPassword] = useState(false) ;

  const {
    register ,
    handelSubmit ,
    formState : {error} ,
  }  = useForm ({
    resolver : zodResolver(SignUpSchema)
  })

  const onSubmit = async (data) =>{
    console.log(data) ;
  }
  
  return (
    <div className='h-screen grid lg:grid-cols-2'>SignUpPage</div>
  )
}

export default SignUpPage
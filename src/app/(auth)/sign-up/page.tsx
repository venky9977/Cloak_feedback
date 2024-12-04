'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const Page = () => {
  const [username, setUsername] = useState('') // State for the username input
  const [usernameMessage, setUsernameMessage] = useState('') // State for dynamic username validation
  const [formErrorMessage, setFormErrorMessage] = useState('') // State for form submission errors
  const [isCheckingUsername, setIsCheckingUsername] = useState(false) // State to indicate username check in progress
  const [isSubmitting, setIsSubmitting] = useState(false) // State to indicate form submission in progress

  const latestUsername = useRef<string | null>(null) // Track the latest username being validated
  const debounced = useDebounceCallback(setUsername, 300) // Debounced username update
  const { toast } = useToast()
  const router = useRouter()

  // Zod form validation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  // Function to validate username
  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setUsernameMessage('') // Handle empty username
      return
    }

    // Track the latest username being validated
    latestUsername.current = username

    setUsernameMessage('Checking username...')
    setIsCheckingUsername(true)

    try {
      const response = await axios.get(`/api/check-username-unique?username=${username}`)
      // Ignore outdated results
      if (latestUsername.current !== username) return

      const message = response.data.message
      setUsernameMessage(message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      if (latestUsername.current !== username) return

      setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
    } finally {
      if (latestUsername.current === username) {
        setIsCheckingUsername(false) // Only update if it's the latest username
      }
    }
  }

  // Handle username change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setUsernameMessage('') // Clear dynamic validation messages immediately
    setFormErrorMessage('') // Clear form validation errors immediately
    debounced(newValue) // Debounce the username change
    form.setValue('username', newValue) // Update the form value
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    // Clear all messages before submission
    setUsernameMessage('')
    setFormErrorMessage('')
    setIsSubmitting(true)

    // Validate username explicitly before submitting
    if (data.username.trim().length < 2) {
      setFormErrorMessage('Username should be at least 2 characters')
      setIsSubmitting(false)
      return
    }

    await validateUsername(data.username)

    // If there's an issue with the username, stop submission
    if (usernameMessage && !usernameMessage.includes('available')) {
      setIsSubmitting(false)
      return
    }

    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data)
      toast({
        title: 'Success',
        description: response.data.message
      })
      router.replace(`/verify/${data.username}`)
    } catch (error) {
      console.error("Error in signup of user", error)
      const axiosError = error as AxiosError<ApiResponse>
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Effect to run username validation on change
  useEffect(() => {
    if (isSubmitting) return // Skip validation during submission
    validateUsername(username)
  }, [username])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Cloak Feedback
          </h1>
          <p className="mb-4">Signup to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={handleUsernameChange} // Handle username changes
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  <p className={`text-sm ${usernameMessage.includes('available') ? 'text-green-500' : 'text-red-500'}`}>
                    {usernameMessage}
                  </p>
                  <p className="text-sm text-red-500">{formErrorMessage}</p> {}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                'Signup'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page

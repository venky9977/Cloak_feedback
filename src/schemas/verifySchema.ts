import {z} from 'zod'

export const verifySchema = z.object({
    code: z.string().length(5,'Verification code must be 5 digits')
})
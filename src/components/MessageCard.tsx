'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`,
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      toast({
        title: response.data.message,
      });
      onMessageDelete(message._id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.message || "Failed to delete the message.",
        variant: "destructive",
      });
    }
  };

  // Format the message date and time
  const formattedDate = new Date(message.createdAt).toLocaleString();

  return (
    <Card className="relative">
      {/* Header with Message Title and Date */}
      <CardHeader>
        <div>
          <CardTitle>{message.content}</CardTitle>
          <CardDescription>{formattedDate}</CardDescription>
        </div>
      </CardHeader>
      {/* Message Content */}
      <CardContent>
        {/* Additional content can be placed here if needed */}
      </CardContent>
      {/* Delete Button Positioned at the Bottom Right */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="absolute bottom-2 right-2 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-half hover:bg-red-600 focus:outline-none"
            aria-label="Delete Message"
          >
            X
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MessageCard;

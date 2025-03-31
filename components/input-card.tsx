"use client"

import React from "react"
import { FileText, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

interface InputCardProps {
  inputText: string
  onInputChange: (value: string) => void
  isLoading: boolean
  progress: number
  loadingStatus: string
  onGenerate: () => void
}

export function InputCard({
  inputText,
  onInputChange,
  isLoading,
  progress,
  loadingStatus,
  onGenerate,
}: InputCardProps) {
  return (
    <Card className="w-full max-w-xl h-fit mt-12">
      <CardHeader className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
          <div className="rounded-full bg-primary/10 p-2">
            <FileText className="h-6 w-6" />
          </div>
          <Plus className="h-4 w-4" />
          <div className="rounded-full bg-primary/10 p-2">
            <Loader2 className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Contact Creator</CardTitle>
          <CardDescription className="text-base">
            Enter some text to generate a list of contacts.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full p-4 border rounded-lg"
            rows={10}
          />
          <Button onClick={onGenerate} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span>Create Contacts</span>
            )}
          </Button>
        </div>
      </CardContent>
      {isLoading && (
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="w-full space-y-2">
            <div className="grid grid-cols-6 sm:grid-cols-4 items-center space-x-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  isLoading ? "bg-yellow-500/50 animate-pulse" : "bg-muted"
                }`}
              />
              <span className="text-muted-foreground text-center col-span-4 sm:col-span-2">
                {loadingStatus}
              </span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Utensils, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    clearError();

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-heading font-bold text-foreground">
              Check your email
            </h1>
            <p className="text-body text-muted-foreground">
              We've sent a password reset link to {email}
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again
                  with a different email address.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  Try again
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signin" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Utensils className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-heading font-bold text-foreground">
            Reset your password
          </h1>
          <p className="text-body text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {/* Reset Password Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-subheading text-center">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-center">
              No worries, we'll send you reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Link href="/auth/signin" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/auth/signin"
            className="text-accent hover:text-accent/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Award,
  Eye,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react"

interface ScoutVerification {
  id: string
  spotId: string
  scoutId: string
  scoutName: string
  scoutLevel: number
  scoutBadges: string[]
  verification: "verified" | "flagged" | "needs_review"
  confidence: number
  notes: string
  visitDate: string
  photos: string[]
  createdAt: string
}

interface ScoutProfile {
  id: string
  name: string
  email: string
  level: number
  totalVerifications: number
  accuracyRate: number
  badges: string[]
  joinDate: string
  monthlyLimit: number
  monthlyUsed: number
  reputation: number
}

interface ScoutVerificationPanelProps {
  spotId: string
  spotName: string
  currentUser?: ScoutProfile
  existingVerifications?: ScoutVerification[]
  onVerificationSubmit?: (verification: any) => void
}

export function ScoutVerificationPanel({
  spotId,
  spotName,
  currentUser,
  existingVerifications = [],
  onVerificationSubmit,
}: ScoutVerificationPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationForm, setVerificationForm] = useState({
    verification: "",
    confidence: 75,
    notes: "",
    visitDate: new Date().toISOString().split("T")[0],
    photos: [] as File[],
  })
  const [showForm, setShowForm] = useState(false)

  const canVerify = currentUser && currentUser.monthlyUsed < currentUser.monthlyLimit
  const hasAlreadyVerified = existingVerifications.some((v) => v.scoutId === currentUser?.id)

  const handleSubmitVerification = async () => {
    if (!currentUser || !canVerify || hasAlreadyVerified) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/scout-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotId,
          scoutId: currentUser.id,
          verification: verificationForm.verification,
          confidence: verificationForm.confidence,
          notes: verificationForm.notes,
          visitDate: verificationForm.visitDate,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onVerificationSubmit?.(result.verification)
        setShowForm(false)
        setVerificationForm({
          verification: "",
          confidence: 75,
          notes: "",
          visitDate: new Date().toISOString().split("T")[0],
          photos: [],
        })
      }
    } catch (error) {
      console.error("Scout verification error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoutBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Expert Taster":
        return <Star className="h-4 w-4" />
      case "Reliable Scout":
        return <Shield className="h-4 w-4" />
      case "Photo Pro":
        return <Eye className="h-4 w-4" />
      case "Community Leader":
        return <Users className="h-4 w-4" />
      case "Rising Star":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getVerificationIcon = (verification: string) => {
    switch (verification) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "flagged":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "needs_review":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Scout Status Panel */}
      {currentUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community Scout</h3>
                  <p className="text-sm text-muted-foreground">
                    Level {currentUser.level} • {currentUser.accuracyRate}% accuracy
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {currentUser.monthlyUsed}/{currentUser.monthlyLimit} this month
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Verifications</span>
                  <span>
                    {currentUser.monthlyUsed}/{currentUser.monthlyLimit}
                  </span>
                </div>
                <Progress value={(currentUser.monthlyUsed / currentUser.monthlyLimit) * 100} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-2">
                {currentUser.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="text-xs flex items-center gap-1">
                    {getScoutBadgeIcon(badge)}
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{currentUser.totalVerifications}</p>
                  <p className="text-xs text-muted-foreground">Total Verifications</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{currentUser.reputation}</p>
                  <p className="text-xs text-muted-foreground">Reputation Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{currentUser.level}</p>
                  <p className="text-xs text-muted-foreground">Scout Level</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Action */}
      {currentUser && !hasAlreadyVerified && canVerify && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Verify This Spot</h3>
              <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "Start Verification"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Help the community by verifying the authenticity of {spotName}
            </p>
          </CardHeader>

          {showForm && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Verification Status</Label>
                  <RadioGroup
                    value={verificationForm.verification}
                    onValueChange={(value) => setVerificationForm((prev) => ({ ...prev, verification: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="verified" id="verified" />
                      <Label htmlFor="verified" className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Verified - This is a legitimate Amala spot
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="needs_review" id="needs_review" />
                      <Label htmlFor="needs_review" className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Needs Review - Some concerns or unclear information
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flagged" id="flagged" />
                      <Label htmlFor="flagged" className="text-sm flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Flagged - This appears to be fake or inaccurate
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="confidence" className="text-sm font-medium">
                    Confidence Level: {verificationForm.confidence}%
                  </Label>
                  <input
                    type="range"
                    id="confidence"
                    min="0"
                    max="100"
                    value={verificationForm.confidence}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({ ...prev, confidence: Number.parseInt(e.target.value) }))
                    }
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="visitDate" className="text-sm font-medium">
                    Visit Date
                  </Label>
                  <input
                    type="date"
                    id="visitDate"
                    value={verificationForm.visitDate}
                    onChange={(e) => setVerificationForm((prev) => ({ ...prev, visitDate: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Verification Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={verificationForm.notes}
                    onChange={(e) => setVerificationForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Share details about your visit, food quality, authenticity, or any concerns..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleSubmitVerification}
                  disabled={!verificationForm.verification || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Submitting Verification...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Submit Verification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Verification Limits Message */}
      {currentUser && !canVerify && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Monthly Limit Reached</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You've used all {currentUser.monthlyLimit} verifications this month. Limit resets on the 1st.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Verified Message */}
      {hasAlreadyVerified && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Already Verified</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You've already submitted a verification for this spot.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Verifications */}
      {existingVerifications.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">Community Verifications</h3>
            <p className="text-sm text-muted-foreground">
              {existingVerifications.length} scout{existingVerifications.length !== 1 ? "s" : ""} have verified this
              spot
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingVerifications.map((verification) => (
                <div key={verification.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{verification.scoutName}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>Level {verification.scoutLevel}</span>
                          <span>•</span>
                          <span>{verification.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getVerificationIcon(verification.verification)}
                      <Badge
                        variant={
                          verification.verification === "verified"
                            ? "default"
                            : verification.verification === "flagged"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {verification.verification.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {verification.notes && <p className="text-sm text-muted-foreground mb-2">{verification.notes}</p>}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Visited: {new Date(verification.visitDate).toLocaleDateString()}</span>
                    <span>Verified: {new Date(verification.createdAt).toLocaleDateString()}</span>
                  </div>

                  {verification.scoutBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {verification.scoutBadges.slice(0, 3).map((badge) => (
                        <Badge key={badge} variant="outline" className="text-xs flex items-center gap-1">
                          {getScoutBadgeIcon(badge)}
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Become a Scout CTA */}
      {!currentUser && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Become a Community Scout</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Help verify authentic Amala spots and earn badges, reputation, and community recognition.
            </p>
            <Button className="bg-primary hover:bg-primary/90">Join Scout Program</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

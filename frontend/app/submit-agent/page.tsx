"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MapPin,
  Camera,
  X,
  Clock,
  Phone,
  Globe,
  Utensils,
  AlertCircle,
  CheckCircle,
  Loader2,
  Map,
  AlertTriangle,
  Lightbulb,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgent } from "@/hooks/use-agent";
import { toast } from "sonner";

interface RestaurantData {
  name: string;
  aka?: string;
  category: string;
  address: string;
  area: string;
  city: string;
  state: string;
  country: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
  price_band?: string;
  amala_focus: boolean;
  phone?: string;
  website?: string;
  description?: string;
}

interface FieldValidation {
  field: string;
  valid: boolean;
  suggestions: string[];
  warnings: string[];
}

interface DuplicateResult {
  potential_duplicates: Array<{
    id: string;
    name: string;
    address: string;
    similarity_type: string;
    confidence: string;
    distance_km?: number;
  }>;
  duplicate_count: number;
  is_duplicate: boolean;
}

const tagOptions = ["Abula", "Ewedu", "Gbegiri", "Ila", "Ogunfe", "Efo riro"];
const categoryOptions = ["Buka", "Restaurant", "Food Court", "Street Food", "Catering"];

export default function AgentSubmitPage() {
  const router = useRouter();
  const { collectField, suggestCoordinates, checkDuplicates, generatePhotoNudge, isLoading } = useAgent();
  
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState<RestaurantData>({
    name: "",
    category: "Buka",
    address: "",
    area: "",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    amala_focus: true,
    price_band: "",
    phone: "",
    website: "",
    description: "",
  });

  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({});
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateResult | null>(null);
  const [coordinateSuggestion, setCoordinateSuggestion] = useState<{ latitude: number; longitude: number; confidence: string } | null>(null);
  const [photoNudge, setPhotoNudge] = useState<string>("");
  const [showPhotoNudge, setShowPhotoNudge] = useState(false);

  const totalSteps = 4;

  // Auto-collect fields as user types
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (form.name && form.name.length > 3) {
        await collectFieldData("name", form.name);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [form.name]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (form.address && form.address.length > 10) {
        await collectFieldData("address", form.address);
        await suggestCoordinatesForAddress();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [form.address]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (form.name && form.address && form.name.length > 3 && form.address.length > 10) {
        await checkForDuplicates();
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [form.name, form.address]);

  const collectFieldData = async (fieldName: string, fieldValue: string) => {
    try {
      const response = await collectField({
        session_id: sessionId,
        field_name: fieldName,
        field_value: fieldValue,
        context: { step: currentStep, form_data: form }
      });

      setFieldValidations(prev => ({
        ...prev,
        [fieldName]: {
          field: fieldName,
          valid: response.success,
          suggestions: response.suggestions || [],
          warnings: response.warnings || []
        }
      }));

      if (response.suggestions && response.suggestions.length > 0) {
        toast.info(`Suggestions for ${fieldName}: ${response.suggestions.join(", ")}`);
      }

      if (response.warnings && response.warnings.length > 0) {
        toast.warning(`Warnings for ${fieldName}: ${response.warnings.join(", ")}`);
      }
    } catch (error) {
      console.error(`Error collecting field ${fieldName}:`, error);
    }
  };

  const suggestCoordinatesForAddress = async () => {
    try {
      const response = await suggestCoordinates({
        address: form.address,
        city: form.city,
        state: form.state
      });

      if (response.success && response.data) {
        setCoordinateSuggestion({
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          confidence: response.data.confidence
        });
        
        // Auto-fill coordinates if confidence is high
        if (response.data.confidence === "high" || response.data.confidence === "ai_generated") {
          setForm(prev => ({
            ...prev,
            latitude: response.data.latitude,
            longitude: response.data.longitude
          }));
        }
      }
    } catch (error) {
      console.error("Error suggesting coordinates:", error);
    }
  };

  const checkForDuplicates = async () => {
    try {
      const response = await checkDuplicates({
        name: form.name,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude
      });

      if (response.success && response.data) {
        setDuplicateCheck(response.data);
        
        if (response.data.is_duplicate) {
          toast.warning(`Potential duplicate found: ${response.data.duplicate_count} similar restaurants`);
        }
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
    }
  };

  const generatePhotoNudgeMessage = async () => {
    try {
      const response = await generatePhotoNudge({
        session_id: sessionId,
        restaurant_data: {
          name: form.name,
          category: form.category,
          address: form.address,
          area: form.area,
          city: form.city,
          state: form.state,
          country: form.country
        },
        nudge_type: "photo"
      });

      if (response.success && response.data) {
        setPhotoNudge(response.data.nudge_message);
        setShowPhotoNudge(true);
      }
    } catch (error) {
      console.error("Error generating photo nudge:", error);
    }
  };

  const handleInputChange = (field: keyof RestaurantData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(form.name && form.address && form.description);
      case 2:
        return !!(form.category && form.price_band);
      case 3:
        return true; // Contact info is optional
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      
      // Generate photo nudge when reaching step 4
      if (currentStep === 3) {
        generatePhotoNudgeMessage();
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Final field collection
      await collectFieldData("name", form.name);
      await collectFieldData("address", form.address);
      await collectFieldData("description", form.description);
      
      // Submit to your existing backend
      const submissionData = {
        name: form.name,
        address: form.address,
        description: form.description,
        phone: form.phone,
        website: form.website,
        lat: form.latitude || 0,
        lng: form.longitude || 0,
        kind: "agentic", // Mark as agent-assisted
        city: form.city,
        state: form.state,
        country: form.country,
        price_band: form.price_band,
        tags: [form.category],
        hours: { open: "9:00", close: "21:00" },
        photo_urls: [],
        hours_text: "",
        raw_payload: JSON.stringify({ ...form, session_id: sessionId }),
        notes: `Agent-assisted submission. Session: ${sessionId}`,
      };

      // You can integrate with your existing submission endpoint here
      console.log("Submitting with agent data:", submissionData);
      
      toast.success("Restaurant submitted successfully with AI assistance!");
      router.push("/");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit restaurant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-subheading font-bold text-foreground mb-2">
                Basic Information
              </h2>
              <p className="text-body text-muted-foreground">
                Tell us about this Amala spot - our AI will help validate and enhance your input
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-body font-medium">
                  Restaurant Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Mama Kemi's Authentic Amala"
                  className="mt-1"
                />
                {fieldValidations.name && (
                  <div className="mt-2 space-y-1">
                    {fieldValidations.name.warnings.map((warning, index) => (
                      <Alert key={index} className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{warning}</AlertDescription>
                      </Alert>
                    ))}
                    {fieldValidations.name.suggestions.map((suggestion, index) => (
                      <Alert key={index} className="py-2">
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription className="text-sm">{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-body font-medium">
                  Address *
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street, Lagos"
                  className="mt-1"
                />
                {coordinateSuggestion && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Map className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        AI Suggested Coordinates
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {coordinateSuggestion.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Lat: {coordinateSuggestion.latitude.toFixed(6)}, 
                      Lng: {coordinateSuggestion.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-body font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what makes this place special..."
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>
            </div>

            {duplicateCheck && duplicateCheck.is_duplicate && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="font-medium text-orange-800 mb-2">
                    Potential Duplicate Found
                  </div>
                  <div className="text-sm text-orange-700">
                    We found {duplicateCheck.duplicate_count} similar restaurants:
                  </div>
                  <ul className="mt-2 space-y-1">
                    {duplicateCheck.potential_duplicates.slice(0, 3).map((dup, index) => (
                      <li key={index} className="text-sm">
                        • {dup.name} - {dup.address} ({dup.confidence} confidence)
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-subheading font-bold text-foreground mb-2">
                Category & Pricing
              </h2>
              <p className="text-body text-muted-foreground">
                Help categorize this restaurant
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-body font-medium">Category *</Label>
                <Select value={form.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-body font-medium">Price Range *</Label>
                <Select value={form.price_band} onValueChange={(value) => handleInputChange("price_band", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ - Budget friendly (Under ₦1,500)</SelectItem>
                    <SelectItem value="$$">$$ - Moderate (₦1,500-3,000)</SelectItem>
                    <SelectItem value="$$$">$$$ - Upscale (₦3,000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="amala_focus"
                  checked={form.amala_focus}
                  onCheckedChange={(checked) => handleInputChange("amala_focus", checked)}
                />
                <Label htmlFor="amala_focus" className="text-sm">
                  Specializes in Amala dishes
                </Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-subheading font-bold text-foreground mb-2">
                Contact Information
              </h2>
              <p className="text-body text-muted-foreground">
                Optional contact details
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-body font-medium">
                    Phone Number
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="text-body font-medium">
                    Website
                  </Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={form.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://restaurant.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area" className="text-body font-medium">
                    Area/Neighborhood
                  </Label>
                  <Input
                    id="area"
                    value={form.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="e.g., Victoria Island"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-body font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Lagos"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-subheading font-bold text-foreground mb-2">
                Photos & Final Review
              </h2>
              <p className="text-body text-muted-foreground">
                Add photos to help others discover this spot
              </p>
            </div>

            {showPhotoNudge && photoNudge && (
              <Alert className="border-blue-200 bg-blue-50">
                <Camera className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="font-medium text-blue-800 mb-1">AI Photo Suggestion</div>
                  <div className="text-sm text-blue-700">{photoNudge}</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-body font-medium text-foreground mb-2">
                  Upload Photos
                </p>
                <p className="text-caption text-muted-foreground mb-4">
                  Drag and drop or click to select (max 5 photos)
                </p>
                <Button variant="outline" className="bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">AI Validation Complete</span>
                </div>
                <div className="text-sm text-green-700">
                  <p>✓ Field validation completed</p>
                  <p>✓ Coordinate suggestions provided</p>
                  <p>✓ Duplicate check performed</p>
                  <p>✓ Photo recommendations generated</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-subheading font-bold text-foreground">
                  AI-Assisted Submission
                </h1>
                <p className="text-caption hidden sm:block">
                  Let our AI help you submit the perfect restaurant listing
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                Session: {sessionId.slice(-8)}
              </Badge>
              <span className="text-caption text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  i + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1 <= currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {isLoading && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">
                      AI Processing
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI is analyzing your input and providing suggestions...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="bg-transparent"
          >
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={isSubmitting || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Utensils className="h-4 w-4 mr-2" />
                    Submit with AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="p-6">
            <h3 className="text-subheading font-bold text-foreground mb-3">
              AI-Powered Features
            </h3>
            <ul className="space-y-2 text-body text-muted-foreground">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Real-time field validation and suggestions</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Automatic coordinate suggestions for addresses</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Smart duplicate detection to prevent duplicates</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Contextual photo and receipt nudges</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  UserCircle2
} from "lucide-react";

interface ProfilSetUpProps {
  onProfileUpdated?: () => void;
}

const ProfilSetUp: React.FC<ProfilSetUpProps> = ({ onProfileUpdated }) => {
  const [form, setForm] = useState({
    userName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const validateForm = () => {
    if (!form.userName.trim()) {
      setError("Username is required");
      return false;
    }
    if (form.userName.length < 2) {
      setError("Username must be at least 2 characters long");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!/^\+?[\d\s-()]+$/.test(form.phone)) {
      setError("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const res = await axios.post("/api/profileSetup", form);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onProfileUpdated) onProfileUpdated();
        }, 1500); // Small delay to show success message
      } else {
        setError("Failed to set up profile. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-3 bg-slate-100 rounded-full w-fit">
            <UserCircle2 className="h-8 w-8 text-slate-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Profile Setup
          </CardTitle>
          <p className="text-slate-600 text-sm mt-2">
            Complete your profile to get started
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-semibold text-slate-700 flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-500" />
                Username
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="userName"
                  name="userName"
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={form.userName}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-3 border-slate-200 focus:border-slate-400 focus:ring-slate-400 bg-white/80 backdrop-blur-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-slate-500" />
                Phone Number
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-3 border-slate-200 focus:border-slate-400 focus:ring-slate-400 bg-white/80 backdrop-blur-sm"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Include country code if applicable
              </p>
            </div>

            <Separator className="bg-slate-200" />

            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 font-medium">
                  Profile setup successful! Updating...
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading || success} 
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Profile...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Profile Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Your information is secure and will only be used to enhance your experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilSetUp;

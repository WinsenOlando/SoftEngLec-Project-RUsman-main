import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export function UserDeactivation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailToDeactivate, setEmailToDeactivate] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    setEmailToDeactivate(email);
    setShowConfirmation(true);
    setMessage(null);
  };

  const confirmDeactivation = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8888/delete-user/" + emailToDeactivate, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      console.log(result);

      if (result.message === "User deleted") {
        setMessage({
          type: "success",
          text: "User account deactivated successfully!",
        });
        const form = document.getElementById(
          "deactivation-form"
        ) as HTMLFormElement;
        form?.reset();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Deactivation failed",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred" + error,
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setEmailToDeactivate("");
    }
  };

  const cancelDeactivation = () => {
    setShowConfirmation(false);
    setEmailToDeactivate("");
    setMessage(null);
  };

  return (
    <Card className="bg-pink-950/20 border-pink-500/30">
      <CardContent className="p-6">
        {!showConfirmation ? (
          <form
            id="deactivation-form"
            action={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="deactivateEmail" className="text-pink-100">
                User Email Address
              </Label>
              <Input
                id="deactivateEmail"
                name="email"
                type="email"
                required
                className="bg-black/50 border-pink-500/50 text-white placeholder:text-pink-300/50 focus:border-pink-400"
                placeholder="Enter email address to deactivate"
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-200">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  Deactivating a user account will prevent them from accessing
                  the system. This action can be reversed by reactivating the
                  account.
                </p>
              </div>
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md ${
                  message.type === "success"
                    ? "bg-green-900/50 text-green-200 border border-green-500/50"
                    : "bg-red-900/50 text-red-200 border border-red-500/50"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Deactivate User Account
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Confirm Account Deactivation
              </h3>
              <p className="text-pink-200 mb-4">
                Are you sure you want to deactivate the account for:
              </p>
              <p className="text-pink-100 font-semibold bg-black/50 p-2 rounded border border-pink-500/30">
                {emailToDeactivate}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={cancelDeactivation}
                variant="outline"
                className="flex-1 border-pink-500/50 text-pink-100 hover:bg-pink-900/30"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeactivation}
                disabled={isSubmitting}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Deactivating..." : "Confirm Deactivation"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportBugModal: React.FC<ReportBugModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mpwlovbn", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
        }, 3000);
      } else {
        alert("Something went wrong. Please try again later.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[100vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Report a Bug / Contact Us</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Note:</strong> This application is currently tailored for US METAR formats and does not fully support international METAR variations yet.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isSubmitted ? (
            <div className="bg-green-100 text-green-800 border border-green-400 px-6 py-4 rounded">
              Thank you! Your message has been sent successfully.
              <br />
              <span className="text-sm">This window will close automatically in a few seconds.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Company (optional) */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Company (optional)</label>
                <input
                  name="company"
                  className="w-full border border-gray-300 px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Comment or Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full border border-gray-300 px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please describe any bugs you encountered or share your feedback..."
                ></textarea>
              </div>

              {/* How did you hear about us */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  How did you hear about us? (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Search Engine",
                    "Social Media",
                    "Word of mouth",
                    "Aviation Community",
                    "GitHub",
                    "Other",
                  ].map((option) => (
                    <label key={option} className="flex items-center text-gray-700">
                      <input
                        type="radio"
                        name="referralSource"
                        value={option}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded transition ${
                    isSubmitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBugModal;

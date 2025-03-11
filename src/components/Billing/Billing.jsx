import React from 'react';
import { Check, Sparkles, Shield } from "lucide-react";

const Billing = () => {
  return (
    <div className="bg-[#1a191e] dark min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">Manage your plan</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="border-0 text-left rounded-lg overflow-hidden bg-[#1f1f21]">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-white">Free</h2>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">AI-generated project briefs</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Basic editing</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Shareable links</p>
                </div>
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-purple-500">5 generation credits/month</p>
                </div>
              </div>
            </div>
            <div className="px-6 pt-4 pb-6 flex flex-col items-start">
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-gray-400 ml-2">/ month</span>
              </div>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6 py-2 font-medium">
                Your current plan
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="border-0 text-left rounded-lg overflow-hidden bg-[#1f1f21] relative">
            {/* Gradient corner effect */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-purple-600 via-pink-500 to-transparent rounded-tl-full opacity-70"></div>

            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-white">Premium</h2>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Including all free features</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">No watermarks on shared links</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Section regeneration</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Multi-Format Support</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Memory Insights & Reports</p>
                </div>
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-purple-500">25 generation credits/month</p>
                </div>
              </div>
            </div>
            <div className="px-6 pt-4 pb-6 flex flex-col items-start relative z-10">
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-white">$3</span>
                <span className="text-gray-400 ml-2">/ month</span>
              </div>
              <button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 font-medium">
                Upgrade to Premium
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="border-0 text-left rounded-lg overflow-hidden bg-[#1f1f21] relative">
            {/* Gradient corner effect - using blue tones for enterprise */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-blue-600 via-cyan-500 to-transparent rounded-tl-full opacity-70"></div>

            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-white">Enterprise</h2>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">All Premium features</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Custom branding options</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Advanced integration APIs</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Dedicated account manager</p>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Enhanced security & compliance</p>
                </div>
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-400">Unlimited generation credits</p>
                </div>
              </div>
            </div>
            <div className="px-6 pt-4 pb-6 flex flex-col items-start relative z-10">
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-white">Custom</span>
              </div>
              <button className="border border-blue-500 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 rounded-full px-6 py-2 font-medium">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
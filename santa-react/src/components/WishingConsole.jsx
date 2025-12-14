import React, { useState } from 'react';

export default function WishingConsole({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    behavior: 85, // Default to Very Good
    wishQuote: '',
    improvements: '',
    giftSuggestion: ''
  });

  const getBehaviorLabel = (val) => {
    if (val < 25) return 'Naughty';
    if (val < 50) return 'Needs Improvement';
    if (val < 75) return 'Good';
    return 'Very Good';
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.age) {
      alert('Please fill in Name and Age!'); // Simple alert for now
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="flex-grow">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Wishing Console */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Section */}
            <div className="overflow-hidden rounded-2xl bg-paper-light dark:bg-paper-dark shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="relative h-64 w-full sm:h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                  className="h-full w-full object-cover"
                  alt="Santa Claus working at his desk"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf9tNCp_rfeoqgOjZIov93d-rv3B7GFTqGMruTXl70IbG413APXT1qK83uGfgWZofz1LF2DaBe_2E6H3VAWhLZG7veq-djGPMqc7WSUmlO1B6a-P5VCpiYud2DQg9cKjkkBAT_waJ3xDzxi6WTPpAF8gmROmT91cAQpMAMHwfRCGPUw5w85dJ3lvQGfBi1lGfj_abvbmNXv9ZKMZPEyozMIKYo7sD7DmxKYEkEIoWAjt3YXjn3sRVS7fClJvwVN_WoEKuyu36LjQQ"
                />
                <div className="absolute bottom-0 left-0 z-20 p-6 sm:p-8">
                  <div className="inline-flex items-center rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-white mb-3 backdrop-blur-md">
                    <span className="material-symbols-outlined mr-1 text-xs">settings</span>
                    System Online
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Wish Processor 3000</h2>
                  <p className="mt-2 max-w-xl text-gray-200">Direct line to Santa's Workshop. Please ensure all fields are filled accurately by a certified Elf.</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="rounded-2xl bg-paper-light dark:bg-paper-dark p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">edit_note</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">The Wishing Console</h3>
              </div>
              <div className="space-y-8">
                {/* Child Info */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Kid's Name</label>
                    <div className="relative">
                      <input
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
                        placeholder="e.g. Timmy Turner"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-4 text-gray-400">face</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Age</label>
                    <div className="relative">
                      <input
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
                        placeholder="e.g. 8"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-4 text-gray-400">cake</span>
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">speed</span>
                      Behavior Meter
                    </label>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Live Reading</span>
                  </div>
                  <div className="relative w-full pt-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.behavior}
                      onChange={(e) => setFormData({ ...formData, behavior: parseInt(e.target.value) })}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                    <div className="mt-4 flex justify-between px-1 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-gray-400"></span>Coal Candidate</span>
                      <div className="font-bold text-primary text-lg">{getBehaviorLabel(formData.behavior)} ({formData.behavior}%)</div>
                      <span className="flex items-center gap-1 text-primary">Angel<span className="size-2 rounded-full bg-primary"></span></span>
                    </div>
                  </div>
                </div>

                {/* Wish Inputs */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Personalized Wish Quote</label>
                    <textarea
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary resize-none"
                      placeholder="What did they whisper to the mall Santa?"
                      rows="3"
                      value={formData.wishQuote}
                      onChange={(e) => setFormData({ ...formData, wishQuote: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Areas for Improvement</label>
                      <textarea
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary resize-none"
                        placeholder="e.g. Eating vegetables, sharing toys..."
                        rows="2"
                        value={formData.improvements}
                        onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top Gift Suggestion</label>
                      <div className="relative h-full">
                        <textarea
                          className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary resize-none"
                          placeholder="The #1 desired item..."
                          rows="2"
                          value={formData.giftSuggestion}
                          onChange={(e) => setFormData({ ...formData, giftSuggestion: e.target.value })}
                        ></textarea>
                        <span className="material-symbols-outlined absolute right-4 bottom-4 text-primary">card_giftcard</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      SEND TO NORTH POLE
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">send</span>
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </button>
                  <p className="mt-4 text-center text-xs text-gray-500">By clicking send, you confirm you have checked the list twice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Gift Tracker */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 rounded-2xl bg-paper-light dark:bg-paper-dark p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gift Logistics</h3>
                <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <span className="material-symbols-outlined text-gray-500 text-sm">info</span>
                </div>
              </div>

              {/* Stepper (Simplified for React) */}
              <div className="relative px-2">
                <div className="absolute left-6 top-2 h-[calc(100%-20px)] w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                {['Wish Received', 'Processing', 'Quality Check', 'Sleigh Loading', 'In Transit'].map((step, idx) => (
                  <div key={step} className={`relative mb-8 flex gap-4 ${idx > 1 ? 'opacity-50' : ''}`}>
                    <div className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${idx === 0 ? 'bg-primary text-white shadow-lg shadow-primary/30' : idx === 1 ? 'border-2 border-primary bg-paper-light text-primary' : 'border-2 border-gray-200 bg-paper-light text-gray-400'}`}>
                      <span className={`material-symbols-outlined text-sm ${idx === 1 ? 'animate-pulse' : ''}`}>
                        {idx === 0 ? 'mark_email_read' : idx === 1 ? 'handyman' : idx === 2 ? 'verified' : idx === 3 ? 'shopping_bag' : 'flight_takeoff'}
                      </span>
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className={`text-sm ${idx === 1 ? 'font-bold text-primary' : 'font-medium text-gray-900 dark:text-white'}`}>{step}</span>
                      <span className={`text-xs ${idx === 1 ? 'text-primary/80' : 'text-gray-500'}`}>
                        {idx === 0 ? 'Processing via Pneumatic Tube' : idx === 1 ? 'Elves Building' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ad / Fact */}
              <div className="mt-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">cookie</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Elf Tip #42</h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Leaving cookies out increases gift accuracy by 15%.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-2xl bg-paper-light dark:bg-paper-dark overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Live Sleigh GPS</h3>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-gray-500">Offline</span>
                </div>
              </div>
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img className="w-full h-full object-cover opacity-50 grayscale" alt="Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVyKj-fRi0532fOhpZqggd0fbOx2VAzKWHEX5wkjCRFZEZxmomRjAJ1yt-zIXN6Y7U6YYodETv1oP47BkxxJ_VhFxt2tlq8Y7MkHGNNopfV74w82Z4MYxu7vlmJHA4BmwGxOLcPPbP6n44-aTcBKASkmqAIOOBreG_u39ov7As0UAQyavsfBXNzkMODGQPW81zs_aHibR8aC2XZgquASHUWZ-aHpFny7SgZtbvxiTlITSJji4nOXTpXibHFxEbsMH3LyZmt8VHeDs" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4 bg-paper-light/80 dark:bg-paper-dark/80 backdrop-blur rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-gray-400 text-3xl mb-1">satellite_alt</span>
                    <p className="text-xs font-medium text-gray-500">Signal lost due to blizzard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

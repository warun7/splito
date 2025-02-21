"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFriendsModal({ isOpen, onClose }: AddFriendsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[450px]">
        <div className="animate-border-light">
          <div className="relative rounded-[14.77px] bg-black p-4 lg:p-8">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-[29.28px] font-base text-white tracking-[-0.03em] font-instrument-sans">
                Add Friends
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 lg:p-2 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </button>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter name or email address"
                  className="w-full h-12 lg:h-14 bg-[#1F1F23] rounded-2xl pl-16 pr-4 
                  text-base lg:text-lg font-normal text-white 
                  border border-white/10 
                  transition-all duration-300
                  placeholder:text-white/30
                  focus:outline-none focus:border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                />
                <span
                  className="absolute left-6 top-1/2 -translate-y-1/2 
                  text-base lg:text-lg font-medium text-white/50"
                >
                  To:
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  className="h-11 lg:h-12 px-6 lg:px-8
                  rounded-2xl bg-white/10 
                  text-sm lg:text-base font-medium text-white 
                  border border-white/10
                  transition-all duration-300
                  hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

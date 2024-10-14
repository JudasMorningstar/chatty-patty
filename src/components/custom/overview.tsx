import { motion } from "framer-motion";
import Link from "next/link";

import Ripple from "../ui/ripple";

export const Overview = () => {
  return (
    <div className="relative flex h-[800px] w-full flex-col items-center justify-center overflow-hidden  bg-background">
      <p className="z-10 whitespace-pre-wrap text-center text-3xl font-medium tracking-tighter text-white">
        Chatty Patty
      </p>
      <Ripple />
    </div>
  );
};

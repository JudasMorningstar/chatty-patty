import Ripple from "../ui/ripple";
import SparklesText from "../ui/sparkles-text";

export const Overview = () => {
  return (
    <div className="relative flex h-[800px] w-full flex-col items-center justify-center overflow-hidden  bg-background">
      {/* <p className="z-10 whitespace-pre-wrap text-center text-3xl font-medium tracking-tighter text-white">
        
      </p> */}
      <SparklesText className="text-3xl" text={"Chatty Patty"} />
      <Ripple />
    </div>
  );
};

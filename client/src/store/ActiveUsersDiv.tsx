import { useEffect, useRef } from "react";

interface ActiveUsersDivProps {
  otherUsers: { userId: number; userEmail: string; clientId: number; color: string }[];
  setShowActiveUsersPopUp: (value: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}


const ActiveUsersDiv = ({otherUsers , setShowActiveUsersPopUp, triggerRef }: ActiveUsersDivProps) => {

  const popupRef = useRef<HTMLDivElement | null>(null);

    // Optional: click outside to close
  useEffect(() => {
    const handleClick = (e: globalThis.MouseEvent) => {
      // Only close if click is outside BOTH the popup AND the trigger div
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          (!triggerRef?.current || !triggerRef.current.contains(e.target as Node))) {
        setShowActiveUsersPopUp(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

    return (
        <div ref={popupRef} className="absolute top-15 right-10 z-50">

    {/* Arrow */}
    {/* <div className="flex justify-end pr-4">
      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
    </div> */}

    {/* Box */}
    <div className="bg-white shadow-lg rounded-lg p-4 w-70">
      <p className="text-gray-700 font-medium mb-2">
        {otherUsers?.length} viewer{otherUsers?.length > 1 ? "s" : ""}
      </p>

      {otherUsers?.map(user => (
        <div key={user.clientId} className="flex items-center gap-2 mt-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.userEmail[0]}
          </div>
          <span className="text-gray-800 text-xs">{user.userEmail}</span>
        </div>
      ))}
    </div>
  </div>
    )
}

export default ActiveUsersDiv
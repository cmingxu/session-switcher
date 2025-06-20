import { useContext } from "react";

import { GetSessions, CreateSession } from "../wailsjs/go/main/App";
import { AppContext } from "@/contexts/appContext";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";

function AccountHome() {
  const { sessions, setSessions } = useContext(AppContext);

  const createNewSession = async () => {
    const newSession = await CreateSession();
    setSessions(await GetSessions());
  }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Button
          asChild
          className="w-48"
          onClick={createNewSession}
          >
          New
          <CirclePlus className="mr-2" />
        </Button>
      </div>
    )
}

export default AccountHome;

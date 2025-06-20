import { useState, useEffect, useCallback, useContext } from "react";
import {Greet} from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

import { useParams } from "react-router";

import { CreateSession, CloseBrowser, OpenBrowser, GetSession, GetSessions, DeleteSession } from "../wailsjs/go/main/App";
import { AppContext } from "@/contexts/appContext";

import {Link} from "react-router";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import { redirect } from "react-router";

function Account() {
  const { setSessions } = useContext(AppContext);

  let params = useParams();
  const [session, setSession] = useState<main.Session | null>(null);


  useEffect(() => {
    if(params?.uid === "") {
      return
    }

    const fetchSession = async () => {
      setSession(await GetSession(params.uid || ""));
    }

    fetchSession()
  },[params]);


  const closeBrowser = useCallback(async () => {
    if(!session?.uid) {
      return
    }
    await CloseBrowser(session?.uid);
  },[session]);

  const deleteSession = useCallback(async () => {
    if(!!!session?.uid) {
      return
    }

    await DeleteSession(session?.uid);
    setSessions(await GetSessions());

    redirect("/acounts")
  },[session, setSessions]);


  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className="flex items-center gap-2">
        <Label>Name </Label>
        <Input defaultValue={session?.name} />
      </div>

      <div className="flex items-center gap-2">
        <Label>ID</Label>
        <p>{ session?.uid}</p>
      </div>

      <div className="flex items-center gap-2">
        <Label>登录状态</Label>
        <p> { session?.signed ? '是' : '否'}</p>
      </div>

      <div className="flex items-center gap-2">
        <Label>私信</Label>
        <p> 100 </p>
      </div>

      <div className="flex items-center gap-2">
        <Label>粉丝</Label>
        <p> 100 </p>
      </div>

      <div className="flex items-center gap-2">
        <Label>关注</Label>
        <p> 100 </p>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Button className="cursor-pointer" size='sm' onClick={ closeBrowser }> 关闭 </Button>
        <Button className="cursor-pointer" size='sm' onClick={ closeBrowser }> 回私信 </Button>
        <Button className="cursor-pointer" size='sm' onClick={ closeBrowser }> 获取信息 </Button>
        <Button className="cursor-pointer" size='sm' variant="destructive" onClick={ deleteSession }> 删除 </Button>
      </div>

    </div>
  )
}

export default Account;

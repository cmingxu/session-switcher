import { useState, useEffect, useCallback, useContext } from "react";
import {Greet} from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

import { useParams } from "react-router";

import { 
  RenameSession,
  CreateSession, 
  CloseBrowser,
  OpenBrowser,
  GetSession,
  GetSessions,
  DeleteSession } from "../wailsjs/go/main/App";
import { AppContext } from "@/contexts/appContext";

import {Link} from "react-router";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";

function Account() {
  const { setSessions, currentSession, setCurrentSession } = useContext(AppContext);


  const closeBrowser = useCallback(async () => {
    if(!currentSession) return;
    await CloseBrowser(currentSession.uid);
  },[currentSession]);

  const openBrowser = useCallback(async () => {
    if(!currentSession) return;
    await OpenBrowser(currentSession.uid, "https://xiaohongshu.com/explore");
  }, [currentSession]);

  const deleteSession = useCallback(async () => {
    if(!currentSession) return;
    await DeleteSession(currentSession.uid);
    setSessions(await GetSessions());
    setCurrentSession(null)
  },[currentSession, setSessions]);

  const renameSession = useCallback(async (name: string) => {
    if(!currentSession) return;
    if(currentSession?.name === name) return;
    await RenameSession(currentSession.uid, name);
    setCurrentSession({...currentSession, name });
    setSessions(await GetSessions());
  }, [currentSession]);

  const createNewSession = async () => {
    setCurrentSession(await CreateSession())
    setSessions(await GetSessions())
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      { currentSession && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Name </Label>
            <Input value={currentSession?.name} 
              onChange={ (ev: React.ChangeEvent<HTMLInputElement>) => { renameSession(ev.target.value) } } />
          </div>

          <div className="flex items-center gap-2">
            <Label>ID</Label>
            <p>{ currentSession?.uid}</p>
          </div>

          <div className="flex items-center gap-2">
            <Label>登录状态</Label>
            <p> { currentSession?.signed ? '是' : '否'}</p>
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
            <Button className="cursor-pointer" size='sm' onClick={ openBrowser }> 打开 </Button>
            <Button className="cursor-pointer" size='sm' onClick={ closeBrowser }> 关闭 </Button>
            <Button className="cursor-pointer" size='sm' variant="destructive" onClick={ deleteSession }> 删除 </Button>
          </div>
        </div>
      )}
    </div>

  )
}

export default Account;

"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileList, { Team } from "./_components/FileList";
import React, { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import TeamList from "./_components/TeamList";
import { toggleClose } from "@/app/Redux/Menu/menuSlice";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from 'react-redux';
import { RootState } from '@/config/store';

export default function Page() {
  const user = useSelector((state:RootState)=>state.auth.user)
  const dispatch = useDispatch();
  const convex = useConvex();

  const [fileList, setFileList] = useState<any>();
  const [focusedTeam, setfocusedTeam] = useState<string | null>(null);
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [teamListWithCount, setTeamListCount] = useState<Team[]>([]);
  const [userData, setUserdata] = useState<any>();

  useEffect(() => {
    const getTeamData = async () => {
      const result = await convex.query(api.teams.getTeam, {
        email: user.email,
      });
      setTeamList(result);
    };
    if (user) {
      getTeamData();
    }
  }, [user, fileList]);

  useEffect(() => {
    const getAllFiles = async () => {
      const result = await convex.query(api.files.getAllFiles, {});
      const getFilesUser = result.filter(
        (file: { createdBy: string }) => file.createdBy === user.email
      );
      setFileList(getFilesUser);
    };
    if (user) getAllFiles();
  }, [user]);

  useEffect(() => {
    const getData = async () => {
      const result = await convex.query(api.user.getUser, {
        email: user?.email!,
      });
      setUserdata(result[0]);
    };
    if (user) {
      getData();
    }
  }, [user]);

  useEffect(() => {
    if (teamList.length > 0 && fileList?.length > 0 && !focusedTeam) {
      const fileCounts = fileList.reduce(
        (acc: Record<string, number>, file: any) => {
          acc[file.teamId] = (acc[file.teamId] || 0) + 1;
          return acc;
        },
        {}
      );

      const updatedTeams = teamList.map((team) => ({
        ...team,
        fileCount: fileCounts[team._id] || 0,
      }));

      setTeamListCount(updatedTeams);
    }
  }, [fileList, teamList]);

  const allFilesHandler = async () => {
    setfocusedTeam(null);
    setFileList(null);
    const result = await convex.query(api.files.getAllFiles, {});
    const getFilesUser = result.filter(
      (file: { createdBy: string }) => file.createdBy === user.email
    );
    setFileList(getFilesUser);
  };

  return (
    <div className="w-[full] bg-background flex relative flex-col gap-5 px-5 py-10 flex-1 items-start justify-center overflow-y-auto overflow-x-hidden md:px-8">
      <nav className=" flex items-center p-0 absolute top-2 left-2 gap-4">
        <button
          title="Close"
          className="md:hidden relative "
          onClick={() => {
            dispatch(toggleClose());
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="27"
            height="27"
            fill="currentColor"
          >
            <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path>
          </svg>
        </button>
        <Link className="hidden md:inline relative " href={"/dashboard"}>
          <ArrowLeft />
        </Link>
      </nav>

      <div className="flex items-center justify-center w-full">
        <Avatar className="w-[180px] h-[180px]">
          <AvatarImage src={userData?.image} />
          <AvatarFallback className=" text-2xl">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-2 w-full justify-center text-center">
        <h1 className=" text-md font-semibold md:text-xl">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className=" text-gray-400 text-sm md:text-lg">{user?.email}</p>
      </div>

      <div className="flex-1 w-full flex flex-col gap-5 py-2 items-center justify-center">
        <h1 className=" px-5 text-start w-full text-xl font-semibold">
          Teams{" "}
        </h1>
        <TeamList
          focusedTeam={focusedTeam}
          setfocusedTeam={setfocusedTeam}
          setFileList={setFileList}
          teamList={teamListWithCount}
        />
      </div>

      <div className="flex-1 w-full flex flex-col gap-5 py-2 items-center justify-center">
        <div className="flex w-full items-center justify-between">
          <h1 className=" px-5 text-start w-full text-xl font-semibold">
            Files{" "}
          </h1>
          {focusedTeam && (
            <Button onClick={() => allFilesHandler()}>All Files</Button>
          )}
        </div>
        <FileList fileList={fileList || null} teamList={teamList} />
      </div>
    </div>
  );
}

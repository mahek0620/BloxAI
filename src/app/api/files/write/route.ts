import { api } from "../../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

export const PUT = async (req: Request) => {
  try {
    const { teamId, email, memberEmail, writtenBy, fileId } = await req.json();

    if (!teamId || !memberEmail || !email || !fileId)
      return new Response("Parameters missing!!", { status: 401 });

    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    const teamInfo = await client.query(api.teams.getTeamById, { _id: teamId });

    if (!teamInfo.teamMembers.includes(memberEmail)) {
      return new Response("User is not member of the team", { status: 400 });
    }

    if (teamInfo.createdBy !== email) {
      return new Response("Only owner can make changes!!", { status: 400 });
    }

    await client.mutation(api.files.updateWrite, { _id: fileId, writtenBy: [...writtenBy,memberEmail] });

    return new Response("Changed to Public!!", { status: 200 });
  } catch (err) {
    console.log(err);
  }
};
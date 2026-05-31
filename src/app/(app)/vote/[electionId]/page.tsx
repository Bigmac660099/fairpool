import { VoteFlow } from "@/components/vote/VoteFlow";

export default function VotePage({ params }: { params: { electionId: string } }) {
  return <VoteFlow electionId={params.electionId} />;
}

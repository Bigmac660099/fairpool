import { ResultsLive } from "@/components/results/ResultsLive";

export default function ResultsPage({
  params,
}: {
  params: { electionId: string };
}) {
  return <ResultsLive electionId={params.electionId} />;
}

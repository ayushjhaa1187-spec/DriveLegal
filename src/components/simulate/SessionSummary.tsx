import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SessionSummaryProps {
  score: { articulacy: number; accuracy: number };
  onRestart: () => void;
}

export function SessionSummary({ score, onRestart }: SessionSummaryProps) {
  const overall = (score.articulacy + score.accuracy) / 2;
  return (
    <Card className="p-8 max-w-md mx-auto text-center border-indigo-500/20 bg-slate-900 shadow-2xl">
      <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-white mb-2">Simulation Complete</h2>
      <p className="text-slate-400 mb-8">Here is how you performed against the AI officer.</p>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl">
          <span className="text-slate-300 font-medium">Articulacy</span>
          <span className="text-indigo-400 font-mono font-bold text-lg">{score.articulacy}%</span>
        </div>
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl">
          <span className="text-slate-300 font-medium">Legal Accuracy</span>
          <span className="text-amber-400 font-mono font-bold text-lg">{score.accuracy}%</span>
        </div>
      </div>

      {overall >= 80 ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8 flex gap-3 text-left">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-200">You are ready for court! Excellent presentation and solid legal backing.</p>
        </div>
      ) : (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-8 flex gap-3 text-left">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-200">More practice needed. Try to cite specific sections next time!</p>
        </div>
      )}

      <Button onClick={onRestart} fullWidth className="h-14">
        Start New Session
      </Button>
    </Card>
  );
}

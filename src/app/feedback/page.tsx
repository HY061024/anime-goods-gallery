import FeedbackForm from "./FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">意见反馈</h1>
      <p className="mb-6 text-sm text-slate-500">告诉我们你的想法，我们会做得更好</p>
      <FeedbackForm />
    </div>
  );
}

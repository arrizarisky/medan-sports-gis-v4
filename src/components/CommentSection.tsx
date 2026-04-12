import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { Comment } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MessageSquare, Star, Send, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  facilityId: string;
  user: any;
  setIsAuthOpen: (open: boolean) => void
}

export default function CommentSection({ facilityId, user, setIsAuthOpen }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchComments();
  }, [facilityId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("facility_id", facilityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to leave a comment");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            facility_id: facilityId,
            user_id: user.id,
            user_email: user.email,
            content: newComment,
            rating: rating,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setNewComment("");
      setRating(5);
      toast.success("Comment posted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-8 border-t border-slate-100">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-bold text-xl tracking-tight text-amber-500">Reviews ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 soft-shadow-sm">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-all active:scale-90 hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? "fill-amber-500 text-amber-400" : "text-slate-200"}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-xs font-black uppercase tracking-widest text-slate-400">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[120px] bg-white border-none rounded-2xl focus-visible:ring-primary/20 soft-shadow-sm p-4 text-sm font-medium"
            />
          </div>
          <Button type="submit" className="w-full h-12 gap-2 rounded-2xl font-black soft-shadow-lg" disabled={submitting || !newComment.trim()}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Review
          </Button>
        </form>
      ) : (
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200 text-center space-y-3">
          <p className="text-sm text-slate-500 font-bold">Log in to share your experience with this place</p>
          <Button variant="outline" size="sm" className="rounded-full font-bold" onClick={() => setIsAuthOpen(true)}>Log In Now</Button>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4 p-6 rounded-[2rem] border border-slate-100 bg-white soft-shadow-sm hover:soft-shadow transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                   <p className="text-sm font-black text-slate-800 leading-none">{comment.user_email.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 bg-amber-50 px-2 py-1 rounded-full">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < comment.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50/50 rounded-[2rem] border border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}

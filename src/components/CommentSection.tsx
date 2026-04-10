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
}

export default function CommentSection({ facilityId, user }: CommentSectionProps) {
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
    <div className="space-y-6 pt-6 border-t">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Reviews ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-primary/5">
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-6 h-6 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] bg-white border-none focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={submitting || !newComment.trim()}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Review
          </Button>
        </form>
      ) : (
        <div className="bg-secondary/30 p-6 rounded-xl border border-dashed text-center space-y-2">
          <p className="text-sm text-muted-foreground">Log in to share your experience with this place</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2 p-4 rounded-xl border bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none">{comment.user_email.split('@')[0]}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < comment.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}

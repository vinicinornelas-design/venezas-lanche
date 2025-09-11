import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, User } from "lucide-react";

interface SimpleRating {
  id: string;
  cliente_nome: string;
  nota: number;
  comentario: string;
  created_at: string;
}

interface RatingSystemProps {
  itemId?: string;
  itemName?: string;
  customerName?: string;
  customerPhone?: string;
  pedidoId?: string;
  onRatingSubmitted?: () => void;
  showCompactForm?: boolean;
}

interface ItemRating {
  item_id: string;
  average_rating: number;
  total_ratings: number;
  recent_comments: Array<{
    cliente_nome: string;
    nota: number;
    comentario: string;
    created_at: string;
  }>;
}

export default function RatingSystem({ 
  itemId,
  itemName, 
  customerName,
  customerPhone,
  onRatingSubmitted,
  showCompactForm = false
}: RatingSystemProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (itemId) {
      fetchRatings();
    }
  }, [itemId]);

  const fetchRatings = async () => {
    if (!itemId) return;
    
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('item_cardapio_id', itemId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setRatings(data);
        const total = data.length;
        const avg = total > 0 ? data.reduce((sum, r) => sum + r.nota, 0) / total : 0;
        setAvgRating(avg);
        setTotalRatings(total);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const submitRating = async () => {
    if (!selectedRating) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma nota",
        variant: "destructive",
      });
      return;
    }

    if (!customerName) {
      toast({
        title: "Erro",
        description: "Nome do cliente não informado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .insert({
          item_cardapio_id: itemId,
          cliente_nome: customerName,
          cliente_telefone: customerPhone,
          nota: selectedRating,
          comentario: comment || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Sua avaliação foi registrada. Obrigado!",
      });

      // Reset form
      setSelectedRating(0);
      setComment("");
      
      // Refresh ratings
      await fetchRatings();
      
      // Call callback if provided
      onRatingSubmitted?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar avaliação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, size: string = "h-5 w-5") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} cursor-pointer transition-colors ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
            onClick={interactive ? () => setSelectedRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Current Ratings Display */}
      {itemId && totalRatings > 0 && (
        <div className="flex items-center gap-2 text-sm">
          {renderStars(avgRating, false, "h-4 w-4")}
          <span className="font-medium">{avgRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({totalRatings} avaliações)</span>
        </div>
      )}

      {/* Recent Comments */}
      {!showCompactForm && ratings.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Comentários recentes:</h4>
          {ratings.slice(0, 3).map((rating) => (
            <div key={rating.id} className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {renderStars(rating.nota, false, "h-3 w-3")}
                <span className="font-medium text-sm">{rating.cliente_nome}</span>
              </div>
              {rating.comentario && (
                <p className="text-sm text-muted-foreground">{rating.comentario}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Form for Public Menu */}
      {itemName && customerName && (
        <Card className={showCompactForm ? "border-0 shadow-none" : ""}>
          <CardHeader className={showCompactForm ? "px-0 pb-2" : ""}>
            <CardTitle className={`${showCompactForm ? "text-base" : "text-lg"} flex items-center gap-2`}>
              <Star className="h-4 w-4 text-yellow-400" />
              {showCompactForm ? "Avaliar" : "Avalie este item"}
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${showCompactForm ? "px-0" : ""}`}>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sua nota{showCompactForm ? ":" : ` para ${itemName}:`}
              </label>
              {renderStars(selectedRating, true, showCompactForm ? "h-4 w-4" : "h-5 w-5")}
            </div>
            
            {!showCompactForm && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Comentário (opcional):
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte-nos sobre sua experiência..."
                  rows={3}
                />
              </div>
            )}
            
            <Button 
              onClick={submitRating}
              disabled={loading || selectedRating === 0}
              className={`${showCompactForm ? "" : "w-full"} gradient-primary`}
              size={showCompactForm ? "sm" : "default"}
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
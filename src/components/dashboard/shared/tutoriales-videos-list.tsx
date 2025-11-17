"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Clock, CircleQuestionMark, MessageCircle } from "lucide-react";
import { VideoConfig, getVideosByRole } from "@/config/videos";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { FeedbackSheet } from "@/components/features/feedback/feedback-sheet";

interface TutorialesVideosListProps {
  role: string;
}

export function TutorialesVideosList({ role }: TutorialesVideosListProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig | null>(null);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const videos = getVideosByRole(role);

  const [isFeedbackSheetOpen, setIsFeedbackSheetOpen] = useState(false);

  const handleVideoClick = (video: VideoConfig) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handleFeedbackSheetOpenChange = (open: boolean) => {
    setIsFeedbackSheetOpen(open);
  };

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Estamos trabajando para agregar más tutoriales. Proximamente estarán disponibles!!!.</p>
      </div>
    );
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">
              Tutoriales
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 text-balance">
              Te acercamo una lista de tutoriales para ayudarte a gestionar tu empresa de manera eficiente.
            </p>
          </div>

        </div>
      </CardHeader>
      <div className="flex flex-wrap gap-6 p-6">
        {videos.map((video, index) => (
          <Card
            key={`${video.file_id}-${index}`}
            className="overflow-hidden hover:shadow-lg transition-all duration-200 w-full sm:min-w-[280px] sm:flex-1 md:max-w-full lg:max-w-[320px] cursor-pointer py-0"
          >
            <CardContent className="p-0">
              <div className="
              relative 
              w-full 
              sm:aspect-video 
              flex flex-col items-center justify-center max-h-[100px] md:max-h-none bg-primary group overflow-hidden cursor-pointer" onClick={() => handleVideoClick(video)}>
                {video.fil_tag && (
                  <div className="absolute top-2 right-2 z-20">
                    <Badge className="bg-primary text-primary-foreground font-semibold shadow-lg text-xs px-2 py-1">
                      Nuevo !
                    </Badge>
                  </div>
                )}
                <Image
                  src="/assets/FT-main-logo.png"
                  alt={video.file_title}
                  className="object-contain w-[150px] h-[100px] md:w-[80%] md:h-[100%] mx-auto transition-all duration-300"
                  width={400}
                  height={400}
                  priority={true}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-800/70 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border-2 border-white/30 group-hover:border-white">
                    <Play className="w-6 h-6 md:w-6 md:h-6 text-white/80 ml-1 group-hover:text-white transition-colors duration-300" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="p-4 pb-4 space-y-2 flex flex-col">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2">
                    {video.file_title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(video.file_duration)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleVideoClick(video)}
                  className="self-end hidden md:flex md:h-auto md:py-2"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reproducir
                </Button>
              </div>
            </CardContent>

          </Card>

        ))}

      </div>
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-start gap-5">
              <CircleQuestionMark className="w-8 h-8" />
              <div>
                <CardTitle className="text-lg">
                  ¿Falta algun tutorial que consideres necesario?
                </CardTitle>
                <p className="text-md text-muted-foreground mt-1 text-balance">
                  No dudes en enviarnos tu sugerencia y con gusto te ayudamos a tener un nuevo material para tu gestion.
                </p>
                <Button
                  onClick={() => setIsFeedbackSheetOpen(true)}
                  className="mt-3"
                  size="sm"
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Solicitar tutorial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <Dialog open={!!selectedVideo} onOpenChange={handleCloseVideo}>

        <DialogContent
          className="!max-w-[95vw] w-[95vw] md:!max-w-[1000px] md:w-[1000px] !p-0 bg-black border-none shadow-2xl flex items-center justify-center h-auto"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">
            {selectedVideo?.file_title || "Reproducir video"}
          </DialogTitle>

          {selectedVideo && (
            <div
              className="relative w-full bg-black flex items-center justify-center py-4 rounded-lg overflow-hidden group"
              onMouseEnter={() => setIsVideoHovered(true)}
              onMouseLeave={() => setIsVideoHovered(false)}
            >
              <div className="relative w-full bg-black flex items-center rounded-lg overflow-hidden" style={{ aspectRatio: '16 / 7' }}>
                <video
                  key={selectedVideo.file_id}
                  controls
                  autoPlay={false}
                  preload="metadata"
                  className="w-full object-contain"
                  src={`/assets/videos/${selectedVideo.file_name}`}
                >
                  Tu navegador no soporta la reproducción de videos.
                </video>

                <div className={`absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-300 ${isVideoHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="bg-black/80 backdrop-blur-md px-3 py-2 text-white border-b border-white/10 flex flex-row items-center gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDuration(selectedVideo.file_duration)}</span>
                    </div>
                    <span className="hidden sm:inline">-</span>
                    <h5 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-1">{selectedVideo.file_title}</h5>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FeedbackSheet open={isFeedbackSheetOpen} onOpenChange={handleFeedbackSheetOpenChange} />
    </Card>
  );
}

export default TutorialesVideosList;
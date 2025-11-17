export interface VideoConfig {
  file_id: string | number;
  file_name: string;
  file_title: string;
  file_duration: number; 
  file_role: string[]; 
  fil_tag: boolean; 
}

export const videosConfig: VideoConfig[] = [
  {
    file_id: 1,
    file_name: "sample-1.mp4",
    file_title: "Como gestiono mi usuario",
    file_duration: 58,
    file_role: ["all"],
    fil_tag: false
  },
  {
    file_id: 2,
    file_name: "sample-1.mp4",
    file_title: "Enviar un feedback",
    file_duration: 58,
    file_role: ["all"],
    fil_tag: false
  },
  {
    file_id: 3,
    file_name: "sample-1.mp4",
    file_title: "Ver mis mensajes",
    file_duration: 58,
    file_role: ["operador", "owner"],
    fil_tag: false
  },
  {
    file_id: 4,
    file_name: "sample-1.mp4",
    file_title: "Ver mis mensajes",
    file_duration: 58,
    file_role: ["profesional"],
    fil_tag: false
  },
  {
    file_id: 5,
    file_name: "sample-1.mp4",
    file_title: "Gestionar mi empresa",
    file_duration: 58,
    file_role: ["owner"],
    fil_tag: false
  },
  {
    file_id: 6,
    file_name: "sample-1.mp4",
    file_title: "Gestionar las especialidades de mi empresa",
    file_duration: 58,
    file_role: ["owner"],
    fil_tag: false
  },
  {
    file_id: 7,
    file_name: "sample-1.mp4",
    file_title: "Gestionar usuarios y profesionales",
    file_duration: 58,
    file_role: ["owner", "operador"],
    fil_tag: true
  },
  {
    file_id: 8,
    file_name: "sample-1.mp4",
    file_title: "Gestionar clientes recurrentes",
    file_duration: 58,
    file_role: ["owner", "operador"],
    fil_tag: true
  },

  {
    file_id: 7,
    file_name: "sample-1.mp4",
    file_title: "Ver las especialidades y gestionar profesionales",
    file_duration: 58,
    file_role: ["operador"],
    fil_tag: false
  },
  {
    file_id: 9,
    file_name: "sample-1.mp4",
    file_title: "Gestionar nuevos pedidos",
    file_duration: 58,
    file_role: ["owner", "operador"],
    fil_tag: true
  },

];

export function getVideosByRole(userRole: string): VideoConfig[] {
  return videosConfig.filter(video =>
    video.file_role.includes(userRole) || video.file_role.includes("all")
  );
}

export function getVideoById(fileId: string | number): VideoConfig | undefined {
  return videosConfig.find(video => video.file_id === fileId);
}

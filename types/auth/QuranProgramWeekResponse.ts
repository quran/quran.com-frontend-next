interface QuranProgramWeekResponse {
  id: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  additionalResources: Record<string, any>;
  ranges: string[];
}

export default QuranProgramWeekResponse;

import { AxiosInstance } from "axios";
import { API_ROUTES } from "@/lib/api_routes";
import { CompanyConfigData } from "@/types/company";

export class CompanyConfigService {
  constructor(private apiClient: AxiosInstance) {}

  async getConfig(): Promise<CompanyConfigData | null> {
    try {
      const response = await this.apiClient.get<CompanyConfigData>(API_ROUTES.COMPANY_CONFIG);
      return response.data || null;
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      const isPermissionError = axiosError?.response?.status === 403 || axiosError?.response?.status === 401;
      
      if (!isPermissionError) {
        throw error;
      }
      
      return null;
    }
  }
}


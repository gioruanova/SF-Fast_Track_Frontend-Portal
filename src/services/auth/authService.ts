import { AxiosInstance } from "axios";
import { API_ROUTES } from "@/lib/api_routes";
import { User, isCompanyUser } from "@/types/auth";
import { CompanyConfigService } from "../company/companyConfigService";
import { CompanyConfigData } from "@/types/company";

export interface AuthResult {
  user: User;
  companyConfig: CompanyConfigData | null;
}

export class AuthService {
  constructor(
    private apiClient: AxiosInstance,
    private companyConfigService: CompanyConfigService
  ) {}

  async getProfile(): Promise<User> {
    const response = await this.apiClient.get<User>(API_ROUTES.PROFILE);
    
    if (!response.data?.user_id) {
      throw new Error("Invalid user data");
    }
    
    return response.data;
  }

  async refreshSession(): Promise<boolean> {
    try {
      const response = await this.apiClient.get<{ success: boolean }>(API_ROUTES.REFRESH);
      return response.data?.success === true;
    } catch {
      return false;
    }
  }

  async authenticate(): Promise<AuthResult | null> {
    try {
      const user = await this.getProfile();
      
      if (isCompanyUser(user)) {
        const companyConfig = await this.companyConfigService.getConfig();
        return { user, companyConfig };
      }
      
      return { user, companyConfig: null };
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      const isUnauthorized = axiosError?.response?.status === 401 || axiosError?.response?.status === 403;
      
      if (!isUnauthorized) {
        throw error;
      }
      
      const refreshed = await this.refreshSession();
      
      if (!refreshed) {
        return null;
      }
      
      try {
        const user = await this.getProfile();
        
        if (isCompanyUser(user)) {
          const companyConfig = await this.companyConfigService.getConfig();
          return { user, companyConfig };
        }
        
        return { user, companyConfig: null };
      } catch {
        return null;
      }
    }
  }
}


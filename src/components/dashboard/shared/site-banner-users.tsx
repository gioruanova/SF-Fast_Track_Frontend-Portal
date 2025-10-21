
import { useBannerStatus } from "@/hooks/useBannerStatus";

export const SiteBannerUsers = () => {
    const { banner, loading: isLoading } = useBannerStatus();


    if (isLoading) {
        return null;
    }

    if (!banner) {
        return null;
    }

    if (banner.banner_active !== 1) {
        return null;
    }

    if (banner.banner_limit && new Date(banner.banner_limit) < new Date()) {
        return null;
    }

    return (
        <div id="site-banner-users" className="bg-primary text-white text-center md:text-sm text-xs py-1">
            {banner.banner_text}
        </div>
    );
};
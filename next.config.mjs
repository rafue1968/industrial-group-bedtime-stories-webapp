/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "via.placeholder.com", // original
            },
            {
                protocol: "https",
                hostname: "placehold.co", // new placeholder domain
            },
        ],
    }
};

export default nextConfig;

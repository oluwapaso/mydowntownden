/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['s3.amazonaws.com', 'www.amazonaws.com', 'amazonaws.com', "gstatic.com","maps.gstatic.com", "mydowntownden.com"],
    },
    webpack: (config) => {
        config.resolve = {
        ...config.resolve,
            fallback: {
                fs: false,
            },
        };
        return config;
    },
};

export default nextConfig;

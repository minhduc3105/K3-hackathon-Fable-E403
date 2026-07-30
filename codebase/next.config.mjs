/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/course/comp2010/reader?lectureId=Lecture_material_ms204v3b_r9mo78&materialId=day05-requirements",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

const environment = {
  API_KEY: process.env.NEXT_PUBLIC_API_KEY ?? "",
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",

  P_CHART_API_KEY: process.env.NEXT_PUBLIC_P_CHART_API_KEY ?? "",
  P_CHART_API_URL: process.env.NEXT_PUBLIC_P_CHART_API_URL ?? "",
};

export default environment;

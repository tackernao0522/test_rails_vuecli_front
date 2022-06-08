import axios from "axios";


export default () => {
  // eslint-disable-next-line no-console
  console.log(process.env.VUE_APP_API_ORIGIN)
  const API_URL = axios.create({
    baseURL: `${process.env.VUE_APP_API_ORIGIN}`,
  })
  return API_URL;
};

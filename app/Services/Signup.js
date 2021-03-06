import axios from 'axios';
import {APIConfig} from '../Actions/Config';

export const SignupService = (payload) => {
  // try {
  return new Promise((resolve, reject) => {
    const {protocol, url} = APIConfig;
    axios.post(`${protocol}://${url}/treemapper/profiles`, payload).then((res => {
      const {status, data} = res;
      if (status === 200) {
        resolve(data);
        console.log(data);
      }
    })).catch(err => {
      console.log(err);
      reject(err);
    });
  });
};

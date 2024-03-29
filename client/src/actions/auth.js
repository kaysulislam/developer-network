import axios from 'axios';

import { setAlert } from './alert';
import { baseURL, REGISTER_SUCCESS, REGISTER_FAIL } from '../actions/types';

//Register User
export const register =
  ({ name, email, password }) =>
  async dispatch => {
    const config = {
      headers: {
        'Content-type': 'application/json',
      },
    };
    const body = JSON.stringify({ name, email, password });
    try {
      const res = await axios.post(`${baseURL}/api/users`, body, config);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      // display alert for any errors in name, email, password
      // reducer: setAlert
      const errors = err.response.data.errors;
      if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
      }

      dispatch({
        type: REGISTER_FAIL,
      });
    }
  };

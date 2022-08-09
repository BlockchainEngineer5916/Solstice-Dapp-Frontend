import axios from "axios";
import qs from 'qs' ;
import { stripe_api_origin } from "../constants/static";

export const createCustomer = async (req) => {
    try {
        let data = qs.stringify(req) ;

        let res = await axios({
            method : 'post',
            url : stripe_api_origin + 'customers',
            headers : { 
                'Authorization' : `Bearer ` +  process.env.REACT_APP_STRIPE_PRV_KEY ,
                'Content-Type':'application/x-www-form-urlencoded'
            },
            data : data
        }) ;

        return res ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}
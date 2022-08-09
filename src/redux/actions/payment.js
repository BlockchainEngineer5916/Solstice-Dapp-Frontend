import axios from "axios";
import { collection, doc, getDoc, getDocs, setDoc, query , where, updateDoc} from "firebase/firestore";
import { set, ref, child, update, onValue  } from 'firebase/database' ;
import { ipfs_origin } from "../../constants/static";
import { db, realDb } from "../../firebase/config";
import { retrievePaymentIntent } from "../../stripe/payment_api";
import { createTransfer } from "../../stripe/transfer_api";
import { getCookie } from "../../utils/Helper";
import ActionTypes from "./actionTypes";

import md5 from "md5";
import emailjs from 'emailjs-com';

export const CreatorProfile = (creator_id) => async dispatch => {
    try {
        let profile =  await getDoc(doc(db, "Web_Users", creator_id)) ;

        return {
            full_name : profile.data().full_name,
            account_name : profile.data().account_name,
            profile_picture_url : profile.data().profile_picture_url
        }
    } catch(err) {
        console.log(err) ;
        return false ;
    }
} 

export const FetchAllPayments = () => async dispatch =>{
    try {
        const starCountRef = ref(realDb, 'Web_Payments/');
        
        onValue(starCountRef, async (snapshot) => {
            const data = snapshot.val();
            
            await dispatch({
                type : ActionTypes.FetchAllPayments,
                payload : data || {}
            }) ;
        });

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const SendAccessUrlByEmail = async (
    product_id,
    product_name, 
    creator_email, creator_account_name, 
    buyer_email, buyer_account_name ,
    license_key = null
) =>  {
    try {
        let message = `<html><body><h1>Product Name : ${product_name}</h1><br/>` ;

        let solDocs = await getDocs(query(collection(db, "Web_Solts"), where('product_id', "==", product_id))) ;

        await Promise.all(
            solDocs.docs.map(async sol => {
                try {
                    let sol_meta = await axios.get(ipfs_origin + ipfs_sol_hash) ;
                    if(license_key) message += sol_meta.data.name + " : https://solsapp.com/sols?access_key=" + sol.data().access_key +
                                                "&license_key=" + license_key + " <br/>" ;
                    else message += sol_meta.data.name  + " : https://solsapp.com/sols?access_key=" + sol.data().access_key + " <br/>" ;
                } catch(err){

                }
            })
        )

        var templateParams = {
            from_email : creator_email ,
            to_email : buyer_email,
            from_name : creator_account_name,
            to_name : buyer_account_name,
            message : message
        }

        let res = await emailjs.send(process.env.REACT_APP_EMAIL_SERVICE_ID, process.env.REACT_APP_EMAIL_TEMPLATE_ID, templateParams, process.env.REACT_APP_EMAIL_USER_ID) ;
        
        console.log('success');
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}



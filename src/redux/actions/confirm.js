import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import ActionTypes from "./actionTypes";

export const ConfirmUserStripeAccountId = async (user_id) => {
    try {
        await updateDoc(doc(db, "Web_Users", user_id), {
            stripe_account_create_confirm_code : 'confirmed'
        }) ;

        return true ;
    } catch(err) {
        return false ;
    } 
}

export const UserStripeCreateConfirmInfo = async (user_id) => {
    try {
        let userDoc = await getDoc(doc(db, "Web_Users", user_id)) ;

        return {
            stripe_account_id : userDoc.data().stripe_account_id,
            stripe_account_create_confirm_code : userDoc.data().stripe_account_create_confirm_code
        } ;

    } catch(err) {
        console.log(err) ;
        return false ;
    }
}
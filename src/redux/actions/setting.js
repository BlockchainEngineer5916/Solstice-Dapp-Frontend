import { deleteDoc, doc, getDoc , updateDoc} from "firebase/firestore";
import { db } from "../../firebase/config";
import { getCookie } from "../../utils/Helper";
import ActionTypes from "./actionTypes";

import { createAccount, createAccountLink, deleteAccount } from "../../stripe/account_api";
import { v4 as uuidv4 } from 'uuid' ;

export const ExpandedItem = (expandedItem) => async dispatch => {
    try {
        await dispatch({
            type : ActionTypes.ExpandedItem,
            payload : expandedItem
        }) ;
        
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const RegisterUserStripeAccountID = async (account_id) => {
    try {
        await updateDoc(doc(db , "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
            stripe_account_id : account_id
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
} 

export const CreateStripeAccount = async (req_create_account) => {
    try {
        let res_create_account = await createAccount(req_create_account) ;

        if(!res_create_account)  return 'create_account_error' ;

        let confirm_code = uuidv4() ;

        await updateDoc(doc(db, "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
            stripe_account_create_confirm_code : confirm_code ,
            stripe_account_id : res_create_account.id 
        }) ;

        let req_create_account_link  = {
            'account': res_create_account.id,
            'refresh_url': location.origin + '/solstice/setting-screen',
            'return_url':   location.origin + '/confirm/stripe-account-create?user_id=' + getCookie('_SOLSTICE_AUTHUSER') 
                            + "&stripe_account_id=" + res_create_account.id 
                            + "&stripe_account_create_confirm_code=" + confirm_code,
            'type': 'account_onboarding'
        }

        let res_create_account_link = await createAccountLink(req_create_account_link) ;

        if(!res_create_account_link) {
            await deleteAccount(res_create_account.id) ;
            
            await updateDoc(doc(db, "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
                stripe_account_id : null,
                stripe_account_create_confirm_code : null
            }) ;

            return 'create_account_link_error' ;
        }

        window.open(res_create_account_link.url, '_self') ;

    } catch(err) {
        console.log(err) ;
    }
}

export const CompleteStripeAccount = async (stripe_account_id) => {
    try {
        let confirm_code = uuidv4() ;

        await updateDoc(doc(db, "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
            stripe_account_create_confirm_code : confirm_code ,
        }) ;

        let req_create_account_link  = {
            'account': stripe_account_id,
            'refresh_url': location.origin + '/solstice/setting-screen',
            'return_url':   location.origin + '/confirm/stripe-account-create?user_id=' + getCookie('_SOLSTICE_AUTHUSER') 
                            + "&stripe_account_id=" + stripe_account_id 
                            + "&stripe_account_create_confirm_code=" + confirm_code,
            'type': 'account_onboarding'
        }

        let res_create_account_link = await createAccountLink(req_create_account_link) ;

        if(!res_create_account_link) {
            await deleteAccount(stripe_account_id) ;
            
            await updateDoc(doc(db, "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
                stripe_account_id : null,
                stripe_account_create_confirm_code : null
            }) ;

            return 'create_account_link_error' ;
        }

        window.open(res_create_account_link.url, '_self') ;
        
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}
export const DeleteUserStripeAccountId = async () => {
    try {
        await updateDoc(doc(db, "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
            stripe_account_id : null,
            stripe_account_create_confirm_code : null
        }) ;

        return false ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}
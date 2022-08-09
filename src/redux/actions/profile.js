import ActionTypes from "./actionTypes";

import { db, auth } from "../../firebase/config";
import { doc, setDoc, getDoc, updateDoc, getDocs, query, collection, orderBy, where } from 'firebase/firestore' ;
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage' ;
import { getCookie, getProductId, getUuid } from "../../utils/Helper";
import axios from "axios";

import { ipfs_origin } from '../../constants/static' ;

export const UserAccountInfo = (userUuid) => async dispatch => {
    try {
        let docSnap = await getDoc(doc(db, "Web_Users", userUuid) ) ;

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const d = new Date(docSnap.data().joined_date);
        let month = months[d.getMonth()];

        await dispatch({
            type : ActionTypes.UserAccountInfo,
            payload : {
                fullName : docSnap.data().full_name,
                email : docSnap.data().email,
                phone_number : docSnap.data().phone_number,
                coverPictureUrl : docSnap.data().cover_picture_url,
                profilePictureUrl : docSnap.data().profile_picture_url,
                productTypeList : docSnap.data().product_type_list,
                jobTag : docSnap.data().job_tag,
                accountName : docSnap.data().account_name,
                productCount : docSnap.data().product_count,
                platformCount : docSnap.data().platform_count,
                resellerCount : docSnap.data().reseller_count,
                customers : docSnap.data().customers,
                joinedDate : month + " " + d.getFullYear(),
                hostId : docSnap.data().host_id,
                profileMessage : docSnap.data().profile_message,
                profileLink : docSnap.data().profile_link,
                stripe_account_id : docSnap.data().stripe_account_id || null,
                stripe_customer_id : docSnap.data().stripe_customer_id || null,
                stripe_account_create_confirm_code : docSnap.data().stripe_account_create_confirm_code || null
            }
        });

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const SaveNewMessage = (message) => async dispatch => {
    try {
        await updateDoc(doc(db, "Web_Users", getCookie('_SOLSTICE_AUTHUSER')), {
            profile_message : message
        });

        await dispatch({
            type : ActionTypes.UpdateProfileMessage,
            payload : message 
        }) ;

        return true ;
        
    } catch(err) {
        console.log(err);
        return false ;
    }
}

export const UserAllProducts = () => async dispatch => {
    try {

        console.log(getCookie('_SOLSTICE_AUTHUSER'));

        let productDocs = await getDocs(collection(db, "Web_Products")) ;

        productDocs = productDocs.docs.filter(productDoc => 
            productDoc.data().owners_ids.includes(getCookie('_SOLSTICE_AUTHUSER')) ||
            productDoc.data().buyers_ids.includes(getCookie('_SOLSTICE_AUTHUSER')) ||
            productDoc.data().creator_id === getCookie('_SOLSTICE_AUTHUSER')
        );

        console.log(productDocs.length) ;

        let productsList = [] ;

        await Promise.all(
            productDocs.map(async product => {
                try {
                    let product_meta = await axios.get(ipfs_origin + product.data().ipfs_product_hash) ;

                    let solDocs = await getDocs(query(collection(db, "Web_Solts"), where('product_id', '==', product.id))) ;

                    let sols = [] ;

                    await Promise.all(
                        solDocs.docs.map(async sol  => {
                            try {
                                let sol_meta = await axios.get(ipfs_origin + sol.data().ipfs_sol_hash ) ;
        
                                let asset_url = ipfs_origin + sol_meta.data.ipfs_asset_hash ;

                                sols.push({
                                    path : asset_url ,
                                    ...sol.data(),
                                    ...sol_meta.data,
                                    id : sol.id,
                                });
                            } catch(err) {

                            }
                        })
                    ) ;

                   if(sols.length) {
                        productsList.push({
                            ...product_meta.data,
                            ...product.data(),
                            id : product.id,
                            sols : sols
                        }) ;
                   }

                } catch(err) {
                    console.log(err) ;
                }
            })
        ) ;

        console.log(productsList) ;

        await dispatch({
            type : ActionTypes.UserAllProducts,
            payload : productsList
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    } 
}
export const LoadingProductsList = (loadingProductsList) => async dispatch => {
    try {
        await dispatch({
            type : ActionTypes.LoadingProductsList,
            payload : loadingProductsList
        }) ;
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

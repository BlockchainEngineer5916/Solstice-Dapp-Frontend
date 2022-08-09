import ActionTypes from './actionTypes' ;
import { db } from '../../firebase/config';

import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore' ;
import axios from 'axios';

import emailjs from 'emailjs-com';
import { ipfs_origin } from '../../constants/static';

export const WholeInformation = (access_key, license_key) => async dispatch => {
    try {  

        if(!access_key) return false ;

        let solDocs = await getDocs(query(collection(db, "Web_Solts"), where('access_key', '==', access_key))) ;

        let solInfo ;
        let productInfo ;
        let creatorInfo ;
        let buyerInfo ;
        
        if(solDocs.size) {
            let solData = {
                ...solDocs.docs[0].data(),
                id : solDocs.docs[0].id
            } ;

            try {
                let sol_meta = await axios.get(ipfs_origin + solData.ipfs_sol_hash) ;

                solInfo = {
                    ...solData,
                    ...sol_meta.data,
                    path : ipfs_origin + sol_meta.data.ipfs_asset_hash,
                    id : solDocs.docs[0].id,
                } ;

                let productDoc = await getDoc(doc(db, "Web_Products", solData.product_id)) ;

                if(productDoc.exists()) {
                    try {
                        let product_meta = await axios.get(ipfs_origin + productDoc.data().ipfs_product_hash) ;

                        productInfo = {
                            ...product_meta.data,
                            id : productDoc.id,
                            ...productDoc.data()
                        } ;

                        let creatorDoc = await getDoc(doc(db, "Web_Users", productInfo.creator_id)) ;

                        if(!creatorDoc.exists()) return false ;

                        creatorInfo = {
                            ...creatorDoc.data(),
                            id : creatorDoc.id
                        }
                        
                        if(productInfo.price_type !== 'bundle') {
                            await dispatch({
                                type : ActionTypes.ProductPageInfo,
                                payload : {
                                    solInfo : solInfo,
                                    creatorInfo: creatorInfo,
                                    productInfo : productInfo
                                }
                            }) ;

                            return true ;
                        }

                        if(!license_key) return false ;

                        let temp = Object.entries(productInfo.buyers_meta).filter(([id, buyer_meta]) => 
                            buyer_meta.license_key === license_key 
                        ) ;

                        if(!temp.length) return false ; 


                        let buyerDoc = await getDoc(doc(db, "Web_Users", temp[0][0])) ;

                        buyerInfo = {
                            ...buyerDoc.data(),
                            id : buyerDoc.id
                        }
                        
                        await dispatch({
                            type : ActionTypes.ProductPageInfo,
                            payload : {
                                solInfo : solInfo,
                                buyerInfo : buyerInfo,
                                creatorInfo: creatorInfo,
                                productInfo : productInfo
                            }
                        }) ;

                        return true ;
               
                    } catch(err) {
                        return false ;
                    }
                }

                return false ;
            } catch(err) {
                return false ;
            }
        }
        return false ;
    } catch(err) {

        console.log(err) ;
        return false;
    }
}

export const CheckingProductUrl = (isChecking) => async dispatch => {
    try {
        await dispatch({
            type : ActionTypes.CheckingProductUrl,
            payload : isChecking
        }) ;
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const InitSOLInfo = () => async dispatch => {
    try {
        await dispatch({
            type : ActionTypes.InitSOLInfo,
        }) ;
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const SendAccessUrlByEmail = async (product_id, creator_info, buyer_info, access_key, license_key) => {
    try {
        
        let solDocs = await getDocs(query(collection(db, "Web_Solts"), where('product_id', "==", product_id))) ;
        let productDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let message = `<html><body><h1>Product Name : ${productDoc.data()?.product_name}</h1><br/>` ;

        await Promise.all(
            solDocs.docs.map(async sol => {
                if(license_key) message += sol.data()?.name + " : https://solsapp.com/sols?access_key=" + sol.data().sol_v +
                                            "&license_key=" + license_key + " <br/>" ;
                else message += sol.data()?.name + " : https://solsapp.com/sols?access_key=" + sol.data().sol_v + " <br/>" ;
            })
        )

        var templateParams = {
            from_email : creator_info.email ,
            to_email : buyer_info.email,
            from_name : creator_info.account_name,
            to_name : buyer_info.account_name,
            message : message
        }

        console.log(templateParams) ;

        let res = await emailjs.send(process.env.REACT_APP_EMAIL_SERVICE_ID, process.env.REACT_APP_EMAIL_TEMPLATE_ID, templateParams, process.env.REACT_APP_EMAIL_USER_ID) ;
       
        console.log("success") ;
        
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}
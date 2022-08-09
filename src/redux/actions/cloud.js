import ActionTypes from "./actionTypes";

import {  db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore' ;

import { getCookie } from "../../utils/Helper";

import { ipfs_origin } from '../../constants/static' ;
import axios from 'axios' ;

export const CloudUploadFiles = () => async dispatch => {
    try {

        let videoFiles = [] ;
        let documentFiles = [] ;
        let audioFiles = [] ;
        let imageFiles = [] ;

        let videoTotalSize = 0 ;
        let documentTotalSize = 0 ;
        let audioTotalSize = 0 ;
        let imageTotalSize = 0 ;

        let productDocs = await getDocs(query(collection(db, "Web_Products"), where("creator_id", "==", getCookie('_SOLSTICE_AUTHUSER')))) ;

        for(let product of productDocs.docs) {
            try {
                let product_meta = await axios.get(ipfs_origin + product.data().ipfs_product_hash)   ; 

                let solDocs = await getDocs(query(collection(db, "Web_Solts"), where('product_id', '==', product.id))) ;

                for(let solt of solDocs.docs) {
                    try {
                        let solt_meta = await axios.get( ipfs_origin + solt.data().ipfs_sol_hash ) ;

                        switch(solt_meta.data.category) {
                            case 'pdf' : 
                                documentFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                documentTotalSize += solt_meta.data.size ;
                                break ;
                            case 'vnd.openxmlformats-officedocument.wordprocessingml.document' : 
                                documentFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                documentTotalSize += solt_meta.data.size ;
                                break ;
                            case 'video' : 
                                videoFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                videoTotalSize += solt_meta.data.size ;
                                break ;
                            case 'audio' : 
                                audioFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                audioTotalSize += solt_meta.data.size ;
                                break ;
                            case 'image' : 
                                imageFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                imageTotalSize += solt_meta.data.size ;
                                break ;
                            default :
                                break ;
                        }
                    } catch(err) {
    
                    }
                }
            } catch(err) {

            }
        }

        await dispatch({
            type : ActionTypes.CloudUploadFiles,
            payload : {
                videoFiles : videoFiles,
                audioFiles : audioFiles,
                imageFiles : imageFiles,
                documentFiles : documentFiles,

                documentTotalSize : documentTotalSize,
                videoTotalSize : videoTotalSize,
                imageTotalSize : imageTotalSize,
                audioTotalSize : audioTotalSize
            }
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;

        return false ;
    }
}

export const CloudPurchaseFiles = () => async dispatch => {
    try {

        let videoFiles = [] ;
        let documentFiles = [] ;
        let audioFiles = [] ;
        let imageFiles = [] ;

        let videoTotalSize = 0 ;
        let documentTotalSize = 0 ;
        let audioTotalSize = 0 ;
        let imageTotalSize = 0 ;

        let productDocs = await getDocs(query(collection(db, "Web_Products"), where("creator_id", "!=", getCookie('_SOLSTICE_AUTHUSER')))) ;

        if(productDocs.size) {
            productDocs = productDocs.docs.filter( product =>
                product.data().owners_ids.includes(getCookie('_SOLSTICE_AUTHUSER')) ||
                product.data().buyers_ids.includes(getCookie('_SOLSTICE_AUTHUSER'))
            ) ;
        } else productDocs = [] ;

        for(let product of productDocs) {
            try {
                let product_meta = await axios.get(ipfs_origin + product.data().ipfs_product_hash)   ; 

                let solDocs = await getDocs(query(collection(db, "Web_Solts"), where('product_id', '==', product.id))) ;

                for(let solt of solDocs.docs) {
                    try {
                        let solt_meta = await axios.get( ipfs_origin + solt_meta.data.ipfs_sol_hash ) ;
    
                        switch(solt_meta.data.category) {
                            case 'pdf' : 
                                documentFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                documentTotalSize += solt_meta.data.size ;
                                break ;
                            case 'vnd.openxmlformats-officedocument.wordprocessingml.document' : 
                                documentFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                documentTotalSize += solt_meta.data.size ;
                                break ;
                            case 'video' : 
                                videoFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                videoTotalSize += solt_meta.data.size ;
                                break ;
                            case 'audio' : 
                                audioFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                audioTotalSize += solt_meta.data.size ;
                                break ;
                            case 'image' : 
                                imageFiles.push({
                                    ...solt_meta.data,
                                    path : ipfs_origin + solt_meta.data.ipfs_asset_hash,
                                    product : {
                                        ...product_meta.data
                                    },
                                    id : solt.id
                                });
                                imageTotalSize += solt_meta.data.size ;
                                break ;
                            default :
                                break ;
                        }
                    } catch(err) {
    
                    }
                }
            } catch(err) {

            }
        }

        await dispatch({
            type : ActionTypes.CloudPurchaseFiles,
            payload : {
                videoFiles : videoFiles,
                audioFiles : audioFiles,
                imageFiles : imageFiles,
                documentFiles : documentFiles,

                documentTotalSize : documentTotalSize,
                videoTotalSize : videoTotalSize,
                imageTotalSize : imageTotalSize,
                audioTotalSize : audioTotalSize
            }
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;

        return false ;
    }
}
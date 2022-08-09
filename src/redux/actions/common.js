import ActionTypes from "./actionTypes";

import { db, auth } from "../../firebase/config";
import { doc, setDoc, getDoc, updateDoc, getDocs, query, collection, orderBy, where } from 'firebase/firestore' ;
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage' ;
import { getCookie, getProductId, getUuid } from "../../utils/Helper";
import axios from "axios";

import { ipfs_origin } from '../../constants/static' ;

import { v4 as uuidv4 } from 'uuid' ;

export const ProductInfoById = async (productId) => {
    try {
        if(!productId) return false ;

        await updateDoc(doc(db, "Web_Products", productId), {
            access_key : uuidv4() ,
            payment_link : uuidv4()
        })
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}
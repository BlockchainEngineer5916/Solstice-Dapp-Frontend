import axios from "axios";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where, updateDoc } from "firebase/firestore";
import { ipfs_origin } from "../constants/static";
import { db } from "./config";
import { v4 as uuidv4 } from 'uuid' ;

export const DeleteProductById = async (product_id) => {
    try {
        await deleteDoc(doc(db, "Web_Products", product_id)) ;
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const ProductInfoByIntroLink = async (linkId) => {
    try {
        let productInfo = await getDocs(query(collection(db, "Web_Products"), where('intro_link', "==", linkId))) ;

        if(!productInfo.size) return false ;

        try {
            let product_meta = await axios.get(ipfs_origin + productInfo.docs[0].data().ipfs_product_hash) ;

            let creatorDoc = await getDoc(doc(db, "Web_Users", productInfo.docs[0].data().creator_id)) ;

            let sols = [] ;

            let solDocs = await getDocs(query(collection(db, "Web_Solts"), where("product_id", "==", productInfo.docs[0].id))) ;

            console.log(solDocs.size) ;
            
            await Promise.all(
                solDocs.docs.map(async solDoc => {
                    try {
                        let sol_meta = await axios.post(ipfs_origin + solDoc.data().ipfs_sol_hash) ;

                        console.log(ipfs_origin + sol_meta.data.ipfs_asset_hash);
                        
                        sols.push({
                            id : solDoc.id,
                            ...solDoc.data(),
                            ...sol_meta.data,
                            path : ipfs_origin + sol_meta.data.ipfs_asset_hash
                        })
                    } catch(err) {

                    }
                })
            )

            return {
                id : productInfo.docs[0].id,
                ...product_meta.data,
                ...productInfo.docs[0].data(),
                creator : {
                    id : creatorDoc.id,
                    ...creatorDoc.data()
                },
                sols : sols
            } ;
            
        } catch(err) {
            return false ;
        }
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const ProductInfoByAccessKey = async (access_key) => {
    try {
        let productInfo = await getDocs(query(collection(db, "Web_Products"), where('access_key', "==", access_key))) ;

        if(!productInfo.size) return false ;

        try {
            let product_meta = await axios.get(ipfs_origin + productInfo.docs[0].data().ipfs_product_hash) ;

            let creatorDoc = await getDoc(doc(db, "Web_Users", productInfo.docs[0].data().creator_id)) ;

            let sols = [] ;

            let solDocs = await getDocs(query(collection(db, "Web_Solts"), where("product_id", "==", productInfo.docs[0].id))) ;

            await Promise.all(
                solDocs.docs.map(async solDoc => {
                    try {
                        let sol_meta = await axios.get(ipfs_origin + solDoc.data().ipfs_sol_hash) ;

                        sols.push({
                            id : solDoc.id,
                            ...solDoc.data(),
                            ...sol_meta.data,
                            path : ipfs_origin + sol_meta.data.ipfs_asset_hash
                        })
                    } catch(err) {

                    }
                })
            )

            return {
                id : productInfo.docs[0].id,
                ...product_meta.data,
                ...productInfo.docs[0].data(),
                creator : {
                    id : creatorDoc.id,
                    ...creatorDoc.data()
                },
                sols : sols
            } ;
            
        } catch(err) {
            return false ;
        }
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UpdateBundleBuyersMeta = async (product_id, buyer_id) => {
    try {
        let productDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let new_release_date ;

        if( new Date().getTime() - new Date(productDoc.data().release_date).getTime() > 7 * 24 * 60 * 60 * 1000) {
            new_release_date = new Date().getTime() + 7 * 24 * 60 * 60 * 1000 ;
        } else {
            new_release_date = new Date(productDoc.data().release_date).getTime() + 7 * 24 * 60 * 60 * 1000 ;
        }

        let temp_ids = productDoc.data().buyers_ids ;
        let temp_meta = productDoc.data().buyers_meta ;

        let license_key = uuidv4() ;

        temp_meta[buyer_id] = {
            paid_at : new Date().toLocaleDateString(),
            buyer_id : buyer_id,
            license_key : license_key
        }

        if(!temp_ids.includes(buyer_id)) temp_ids = [...temp_ids, buyer_id] ;

        await updateDoc(doc(db, "Web_Products", product_id), {
            buyers_meta : {...temp_meta},
            buyers_ids : [...temp_ids],
            release_date : new Date(new_release_date).toLocaleDateString()
        }) ;

        return license_key ;

    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UpdateRareOwners = async (product_id, owner_id, owner_wallet) => {
    try {
        let rareDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let owners_ids = rareDoc.data().owners_ids ;
        let owners_wallets = rareDoc.data().owners_wallets ;

        let temp = {
            ...owners_wallets
        } ;

        temp[owner_id] = {
            wallet : owner_wallet
        }

        updateDoc(doc(db, "Web_Products", product_id), {
            owners_ids : [...owners_ids, owner_id],
            owners_wallets : {
                ...temp
            }
        })

        return true ;
    }catch(err){
        console.log(err) ;
        return false ;
    }
}

export const UpdateLegenOwners = async (product_id, owner_id, owner_wallet) => {
    try {
        console.log(product_id, owner_id, owner_wallet) ;

        let productDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let owners_ids = productDoc.data().owners_ids ;
        let owners_wallets = productDoc.data().owners_wallets ;

        let temp = {...owners_wallets} ;

        temp[owner_id] = {
            wallet : owner_wallet
        } ;

        updateDoc(doc(db, "Web_Products", product_id), {
            owners_ids : [...owners_ids, owner_id],
            owners_wallets : {...temp}
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UpdateLegenBuyers = async (product_id, buyer_id, buyer_wallet) => {
    try {
        console.log(product_id, buyer_id, buyer_wallet) ;

        let productDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let buyers_ids = productDoc.data().buyers_ids ;
        let buyers_wallets = productDoc.data().buyers_wallets ;

        let temp = {...buyers_wallets} ;

        temp[buyer_id] = {
            wallet : buyer_wallet || 'by stripe'
        } ;

        await updateDoc(doc(db, "Web_Products", product_id), {
            buyers_ids : [...buyers_ids, buyer_id],
            buyers_wallets : {...temp}
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const CheckBuyerOrOwner = async (product_id, buyer_id, price_type) => {
    try {
        let productInfo = await getDoc(doc(db, "Web_Products", product_id)) ;

        if(price_type === 'legendary') {

            if(productInfo.data().owners_ids.includes(buyer_id)) return 'owner' ;

            if(productInfo.data().buyers_ids.includes(buyer_id)) return 'buyer' ;
        }

        if(price_type === 'rare') {
            if(productInfo.data().owners_ids.includes(buyer_id)) return 'owner' ;
        }

        if(price_type === 'bundle' || price_type === 'free') {
            if(productInfo.data().buyers_ids.includes(buyer_id)) return 'buyer' ;
        }

        return false ;

    } catch(err) {
        console.log(err) ;
        return false;
    }
}


export const FreeOfferProduct = async (product_id, buyer_id) => {
    try {
        let productDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let buyers_ids = productDoc.data().buyers_ids ;

        if(!buyers_ids.includes(buyer_id)) {
            await updateDoc(doc(db, "Web_Products", product_id), {
                buyers_ids : [...buyers_ids, buyer_id]
            }) ;
        }
        
        return true ;
    } catch(err) {
        return false ;
    }
}
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where, updateDoc, increment } from "firebase/firestore";
import { db } from "./config";
import { createCustomer } from "../stripe/customer_api";

export const UserInfoById = async (uuid) => {
    try {
        let userDoc = await getDoc(doc(db, "Web_Users", uuid)) ;

        if(!userDoc.exists()) return false ;

        return {
            id : userDoc.id,
            ...userDoc.data()
        } ;

    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UserInfoByEmail = async (email) => {
    try {
        let buyerDocs = await getDocs(query(collection(db, "Web_Users"), where('email', '==', email))) ;

        if(buyerDocs.size) {
            return {
                id : buyerDocs.docs[0].id,
                ...buyerDocs.docs[0].data()
            }
        } else return 201 ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UpdateResellerCount = async (creator_id) => {
    try {
        await updateDoc(doc(db, "Web_Users", creator_id), {
            reseller_count : increment(1)
        }) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UpdateSellerCustomer = async (seller_id, customer_id) => {
    try {   
        let sellerDoc = await getDoc(doc(db, "Web_Users" , seller_id)) ;
        let customerDoc = await getDoc(doc(db, "Web_Users", customer_id)) ;

        if(!sellerDoc.data().customers?.filter(customer => customer.id === customerDoc.id).length) {
            updateDoc(doc(db, "Web_Users", seller_id), {
                customers : [...sellerDoc.data().customers, {
                    id : customerDoc.id || null,
                    email : customerDoc.data().email || null,
                    account_name : customerDoc.data().account_name || null,
                    profile_link : customerDoc.data().profile_link || null,
                    full_name : customerDoc.data().full_name || null
                }]
            }) ;
        }
        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const CreateUserWithoutPassword = async (fullName, businessName, email, phoneNumber) => {
    try {
        data =  {
            name : fullName,
            email: email,
            phone : phoneNumber,
            payment_method: 'pm_card_visa',
            invoice_settings: { default_payment_method: 'pm_card_visa' },
            description: ''
        }

        let res = await createCustomer( data ) ;

        let newUser = await addDoc(collection(db, "Web_Users"), {
            email : email,
            full_name : fullName,
            account_name : businessName,
            phone_number : phoneNumber,
            stripe_customer_id : res.data.id ,
            profile_picture_url : null,
            cover_photo_url : null,
            password: null,
            user_type : 'external',
            customers : []
        }) ;

        let newUserDoc = await getDoc(doc(db, "Web_Users", newUser.id)) ;

        return {
            ...newUserDoc.data(),
            id : newUserDoc.id
        }
    } catch(err) {
        console.log(err);
        return false ;
    }
}

export const SellerStripeInfo = async (seller_id) => {
    try {   
        let sellerDoc = await getDoc(doc(db, "Web_Users", seller_id)) ;

        return {
            id : sellerDoc.id,
            stripe_account_id : sellerDoc.data().stripe_account_id,
            stripe_customer_id : sellerDoc.data().stripe_customer_id,
            full_name : sellerDoc.data().full_name,
            account_name : sellerDoc.data().account_name,
            profile_link : sellerDoc.data().profile_link,
            profile_picture_url : sellerDoc.data().profile_picture_url,
            email : sellerDoc.data().email
        }
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

